// src/pages/mainStudents/mainStudents.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LipShapka from '../../layout/LipShapka/LipShapka';
import { getUser } from '../../../utils/auth';
import styles from './mainStudents.module.scss';
import Spinner from '../../ui/Spinner/Spinner';
import { getActivePollsForStudent, markStudentPresent } from '../../../services/pollService';
import type { PollNotification } from '../../../services/pollService';

interface Discipline {
  id: number;
  name: string;
  teacher: string;
  icon?: string;
  color?: string;
}

const MainStudents: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();

  // ===== СОСТОЯНИЯ =====
  const [userName, setUserName] = useState<string>('Студент');
  const [selectedDiscipline, setSelectedDiscipline] = useState<number | null>(null);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // ===== СОСТОЯНИЯ ДЛЯ ОПРОСА =====
  const [activePoll, setActivePoll] = useState<PollNotification | null>(null);
  const [isMarked, setIsMarked] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // ===== ПРОВЕРКА АКТИВНОГО ОПРОСА =====
  const checkActivePoll = async () => {
    if (!user) return;

    try {
      const polls = await getActivePollsForStudent(Number(user.id));
      
      if (polls.length > 0) {
        // Берём первый активный опрос
        const poll = polls[0];
        setActivePoll(poll);
        
        // Проверяем, не отметился ли уже студент
        const today = new Date().toISOString().split('T')[0];
        const attendanceResponse = await fetch(
          `/api/attendance?studentId=${user.id}&disciplineId=${poll.disciplineId}&date=${today}`
        );
        const records = await attendanceResponse.json();
        
        // Если уже есть запись с "P" за сегодня — студент уже отметился
        const hasMark = records.some((r: any) => r.status === 'P');
        setIsMarked(hasMark);
      } else {
        setActivePoll(null);
        setIsMarked(false);
      }
    } catch (error) {
      console.error('Ошибка при проверке опроса:', error);
    }
  };

  // ===== ТАЙМЕР ОБРАТНОГО ОТСЧЁТА =====
  useEffect(() => {
    if (!activePoll) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(activePoll.expiresAt);
      const diff = Math.floor((expiry.getTime() - now.getTime()) / 1000);

      if (diff <= 0) {
        setTimeLeft('Время истекло');
        setActivePoll(null);
        return;
      }

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activePoll]);

  // ===== ПЕРИОДИЧЕСКАЯ ПРОВЕРКА ОПРОСА =====
  useEffect(() => {
    if (!user) return;

    // Первая проверка сразу
    checkActivePoll();

    // Проверка каждые 5 секунд
    const interval = setInterval(checkActivePoll, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // ===== ОТМЕТИТЬСЯ =====
  const handleMarkPresent = async () => {
    if (!activePoll || !user || isMarked) return;

    setIsMarking(true);

    try {
      // Получаем дисциплину по названию
      const disciplineResponse = await fetch(`/api/disciplines?name=${activePoll.disciplineName}`);
      const disciplinesData = await disciplineResponse.json();
      const discipline = disciplinesData[0];

      if (!discipline) {
        console.error('Дисциплина не найдена');
        setIsMarking(false);
        return;
      }

      await markStudentPresent(Number(user.id), discipline.id, activePoll.pollId);
      setIsMarked(true);
      
      // Обновляем статус опроса
      await checkActivePoll();
      
    } catch (error) {
      console.error('Ошибка при отметке:', error);
      alert('Не удалось отметиться. Попробуйте ещё раз.');
    } finally {
      setIsMarking(false);
    }
  };

  // ===== ЗАГРУЖАЕМ ДАННЫЕ =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const userData = getUser();
        if (userData) {
          setUserName(userData.fullName);
        }

        // Временные данные дисциплин
        const mockDisciplines: Discipline[] = [
          { id: 1, name: 'Веб-разработка', teacher: 'Михаил Скляров', icon: '🌐', color: '#4A90D9' },
          { id: 2, name: 'Базы данных', teacher: 'Татьяна Александровна', icon: '🗄️', color: '#27AE60' },
          { id: 3, name: 'Программирование', teacher: 'Дмитрий Граков', icon: '💻', color: '#E67E22' },
          { id: 4, name: 'Дизайн интерфейсов', teacher: 'Михаил Скляров', icon: '🎨', color: '#8E44AD' },
          { id: 5, name: 'Jujutsu Kaisen (Modulo)', teacher: 'Dabura Karaba', icon: '📚', color: '#E74C3C' },
        ];

        await new Promise(resolve => setTimeout(resolve, 800));
        setDisciplines(mockDisciplines);

      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ===== ОБРАБОТЧИК КЛИКА =====
  const handleDisciplineClick = (id: number) => {
    setSelectedDiscipline(id);
    setTimeout(() => {
      navigate(`/student/discipline/${id}`);
    }, 300);
  };

  // ===== ВЫХОД =====
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <LipShapka userName={userName} onLogout={handleLogout} />
        <div className={styles.loadingState}>
          <Spinner size="large" text="Загрузка дисциплин..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <LipShapka 
        userName={userName}
        onLogout={handleLogout}
      />

      <div className={styles.content}>
        {/* ===== КНОПКА ОПРОСА (если активен) ===== */}
        {activePoll && !isMarked && (
          <div className={styles.pollBanner}>
            <div className={styles.pollInfo}>
              <span className={styles.pollIcon}>📢</span>
              <div>
                <p className={styles.pollTitle}>
                  <strong>{activePoll.teacherName}</strong> запустил опрос по <strong>«{activePoll.disciplineName}»</strong>
                </p>
                <p className={styles.pollTimer}>⏳ Осталось: <span className={styles.timerValue}>{timeLeft}</span></p>
              </div>
            </div>
            <button 
              className={styles.pollMarkButton}
              onClick={handleMarkPresent}
              disabled={isMarking}
            >
              {isMarking ? '⏳ Отметка...' : '✅ Отметиться'}
            </button>
          </div>
        )}

        {/* ===== СООБЩЕНИЕ ОБ УСПЕШНОЙ ОТМЕТКЕ ===== */}
        {activePoll && isMarked && (
          <div className={styles.pollSuccessBanner}>
            <span className={styles.pollSuccessIcon}>✅</span>
            <p className={styles.pollSuccessText}>
              Вы успешно отметились на опросе по дисциплине <strong>«{activePoll.disciplineName}»</strong>!
            </p>
          </div>
        )}

        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Добро пожаловать, <span className={styles.userNameHighlight}>{userName}</span>!
          </h1>
          <p className={styles.welcomeSubtitle}>
            Выберите дисциплину для просмотра подробной информации
          </p>
        </div>

        <div className={styles.disciplinesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Учебные дисциплины</h2>
            <span className={styles.disciplineCount}>
              {disciplines.length} дисциплин
            </span>
          </div>
          
          <p className={styles.sectionSubtitle}>
            Выберите дисциплину для просмотра подробной информации
          </p>

          <div className={styles.disciplinesGrid}>
            {disciplines.map((discipline) => (
              <div
                key={discipline.id}
                className={`${styles.disciplineCard} ${
                  selectedDiscipline === discipline.id ? styles.selected : ''
                }`}
                onClick={() => handleDisciplineClick(discipline.id)}
                style={{
                  borderColor: selectedDiscipline === discipline.id ? discipline.color : 'var(--ramka)',
                }}
              >
                <div className={styles.cardIcon} style={{ backgroundColor: discipline.color }}>
                  {discipline.icon}
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.disciplineName}>{discipline.name}</h3>
                  <p className={styles.disciplineTeacher}>
                    <span className={styles.teacherLabel}>Преподаватель:</span>
                    {discipline.teacher}
                  </p>
                  <div className={styles.cardFooter}>
                    <span className={styles.viewDetails}>Подробнее →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainStudents;