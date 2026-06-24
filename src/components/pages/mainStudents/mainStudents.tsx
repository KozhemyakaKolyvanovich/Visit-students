// src/pages/mainStudents/mainStudents.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LipShapka from '../../layout/LipShapka/LipShapka';
import { getUser } from '../../../utils/auth';
import styles from './mainStudents.module.scss';
import Spinner from '../../ui/Spinner/Spinner'; // ← ИМПОРТ СПИННЕРА

interface Discipline {
  id: number;
  name: string;
  teacher: string;
  icon?: string;
  color?: string;
}

const MainStudents: React.FC = () => {
  const navigate = useNavigate();

  // ===== СОСТОЯНИЯ =====
  const [userName, setUserName] = useState<string>('Студент');
  const [selectedDiscipline, setSelectedDiscipline] = useState<number | null>(null);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]); // ← состояние для дисциплин
  const [loading, setLoading] = useState<boolean>(true); // ← состояние загрузки

  // ===== ЗАГРУЖАЕМ ИМЯ И ДИСЦИПЛИНЫ =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Загружаем имя пользователя
        const user = getUser();
        if (user) {
          setUserName(user.fullName);
        }

        // 2. Загружаем дисциплины из базы
        // (пока закомментировано, так как у вас временные данные)
        // const response = await fetch('/api/disciplines?groupId=1');
        // const data = await response.json();
        // setDisciplines(data);

        // Временные данные (пока нет API)
        const mockDisciplines: Discipline[] = [
          {
            id: 1,
            name: 'Веб-разработка',
            teacher: 'Михаил Скляров',
            icon: '🌐',
            color: '#4A90D9',
          },
          {
            id: 2,
            name: 'Базы данных',
            teacher: 'Татьяна Александровна',
            icon: '🗄️',
            color: '#27AE60',
          },
          {
            id: 3,
            name: 'Программирование',
            teacher: 'Дмитрий Граков',
            icon: '💻',
            color: '#E67E22',
          },
          {
            id: 4,
            name: 'Дизайн интерфейсов',
            teacher: 'Михаил Скляров',
            icon: '🎨',
            color: '#8E44AD',
          },
          {
            id: 5,
            name: 'Jujutsu Kaisen (Modulo)',
            teacher: 'Dabura Karaba',
            icon: '📚',
            color: '#E74C3C',
          },
        ];

        // Имитация задержки загрузки
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

  // ===== ПОКАЗЫВАЕМ СПИННЕР ПОКА ЗАГРУЖАЮТСЯ ДАННЫЕ =====
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

  // ===== ОСНОВНОЙ РЕНДЕР =====
  return (
    <div className={styles.page}>
      <LipShapka 
        userName={userName}
        onLogout={handleLogout}
      />

      <div className={styles.content}>
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