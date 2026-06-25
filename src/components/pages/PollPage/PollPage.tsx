// src/components/pages/PollPage/PollPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser } from '../../../utils/auth';
import { checkPollStatus, markStudentPresent } from '../../../services/pollService';
import type { Poll } from '../../../services/pollService';
import LipShapka from '../../layout/LipShapka/LipShapka';
import Spinner from '../../ui/Spinner/Spinner';

const PollPage: React.FC = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const user = getUser();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isMarked, setIsMarked] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        if (!pollId) return;
        const pollData = await checkPollStatus(pollId);
        setPoll(pollData);
      } catch (err) {
        setError('Опрос не найден или уже завершён');
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [pollId]);

  useEffect(() => {
    if (!poll) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(poll.expiresAt);
      const diff = Math.floor((expiry.getTime() - now.getTime()) / 1000);

      if (diff <= 0) {
        setTimeLeft('Время истекло');
        if (!poll.active) {
          setError('Опрос завершён');
        }
        return;
      }

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [poll]);

  const handleMarkPresent = async () => {
    if (!poll || !user) return;

    try {
      await markStudentPresent(Number(user.id), poll.disciplineId, pollId!);
      setIsMarked(true);
      setTimeout(() => {
        navigate('/student');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при отметке');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <LipShapka userName={user?.fullName || 'Студент'} onLogout={handleLogout} />
        <Spinner size="large" text="Загрузка опроса..." />
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div style={styles.page}>
        <LipShapka userName={user?.fullName || 'Студент'} onLogout={handleLogout} />
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>⛔ {error || 'Опрос не найден'}</h2>
          <button style={styles.goBackButton} onClick={() => navigate('/student')}>
            ← Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(poll.expiresAt) <= new Date();

  return (
    <div style={styles.page}>
      <LipShapka 
        userName={user?.fullName || 'Студент'}
        onLogout={handleLogout}
      />
      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>📢 Опрос посещаемости</h1>
          
          <div style={styles.info}>
            <p style={styles.infoText}>
              <span style={styles.label}>⏳ Осталось времени:</span>
              <span style={{ ...styles.timeLeft, ...(isExpired ? styles.expired : {}) }}>
                {timeLeft || '0:00'}
              </span>
            </p>
          </div>

          {isMarked ? (
            <div style={styles.successMessage}>
              <h2 style={styles.successTitle}>✅ Вы отметились!</h2>
              <p style={styles.successText}>Перенаправление на главную...</p>
            </div>
          ) : isExpired ? (
            <div style={styles.expiredMessage}>
              <h2 style={styles.expiredTitle}>⏰ Время истекло</h2>
              <p style={styles.expiredText}>Вы не успели отметиться. Будет проставлена неявка.</p>
              <button style={styles.goBackButton} onClick={() => navigate('/student')}>
                ← Вернуться на главную
              </button>
            </div>
          ) : (
            <button 
              style={styles.markButton}
              onClick={handleMarkPresent}
              disabled={isMarked}
            >
              ✅ Отметиться
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== ВСЕ СТИЛИ ВНУТРИ КОМПОНЕНТА =====
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    width: '100vw',
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% 30%, #0F172A 0%, #0A1628 50%, #050A14 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  card: {
    maxWidth: '500px',
    width: '100%',
    background: 'rgba(10, 22, 40, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(59, 130, 246, 0.15)',
    boxShadow: '0 8px 48px rgba(0, 0, 0, 0.5)',
    padding: '40px',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#F8FAFC',
    fontFamily: 'var(--font-family-geologica)',
    marginBottom: '30px',
  },
  info: {
    background: 'rgba(59, 130, 246, 0.05)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
  },
  infoText: {
    fontSize: '18px',
    color: '#E2E8F0',
    fontFamily: 'var(--font-family-geologica)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 0,
  },
  label: {
    color: '#94A3B8',
  },
  timeLeft: {
    fontWeight: 700,
    fontSize: '22px',
    color: '#FCD34D',
  },
  expired: {
    color: '#EF4444',
  },
  markButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
    color: '#FFFFFF',
    fontSize: '20px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-family-geologica)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 24px rgba(59, 130, 246, 0.2)',
  },
  successMessage: {
    padding: '20px',
  },
  successTitle: {
    fontSize: '28px',
    color: '#34D399',
    marginBottom: '10px',
  },
  successText: {
    fontSize: '16px',
    color: '#94A3B8',
  },
  expiredMessage: {
    padding: '20px',
  },
  expiredTitle: {
    fontSize: '28px',
    color: '#EF4444',
    marginBottom: '10px',
  },
  expiredText: {
    fontSize: '16px',
    color: '#94A3B8',
    marginBottom: '20px',
  },
  errorContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
  },
  errorTitle: {
    fontSize: '28px',
    color: '#EF4444',
    fontFamily: 'var(--font-family-geologica)',
  },
  goBackButton: {
    padding: '12px 24px',
    background: 'transparent',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '8px',
    color: '#F8FAFC',
    cursor: 'pointer',
    fontFamily: 'var(--font-family-geologica)',
    fontSize: '16px',
    transition: 'all 0.3s',
  },
};

export default PollPage;