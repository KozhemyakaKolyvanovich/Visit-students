// src/components/ui/PollNotification/PollNotification.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PollNotification.module.scss';

interface PollNotificationProps {
  pollId: string;
  disciplineName: string;
  teacherName: string;
  expiresAt: string;
  onClose: () => void;
}

const PollNotification: React.FC<PollNotificationProps> = ({
  pollId,
  disciplineName,
  teacherName,
  expiresAt,
  onClose,
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = Math.floor((expiry.getTime() - now.getTime()) / 1000);

      if (diff <= 0) {
        setTimeLeft('Время истекло');
        return;
      }

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleClick = () => {
    navigate(`/student/poll/${pollId}`);
    onClose();
  };

  return (
    <div className={styles.notification} onClick={handleClick}>
      <div className={styles.header}>
        <span className={styles.icon}>📢</span>
        <span className={styles.title}>Опрос посещаемости</span>
        <button className={styles.closeBtn} onClick={(e) => { e.stopPropagation(); onClose(); }}>
          ✕
        </button>
      </div>
      <div className={styles.body}>
        <p>
          <strong>{teacherName}</strong> по дисциплине <strong>«{disciplineName}»</strong> запустил опрос о присутствии.
        </p>
        <p className={styles.timer}>
          ⏳ Осталось времени: <span className={styles.timeLeft}>{timeLeft}</span>
        </p>
        <p className={styles.hint}>Нажмите, чтобы отметиться</p>
      </div>
    </div>
  );
};

export default PollNotification;