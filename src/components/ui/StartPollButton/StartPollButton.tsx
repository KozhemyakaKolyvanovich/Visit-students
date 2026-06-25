// src/components/ui/StartPollButton/StartPollButton.tsx
import React from 'react'; // ← убрали useState
import styles from './StartPollButton.module.scss';

interface StartPollButtonProps {
  onStartPoll: () => Promise<void>;
  isPollActive: boolean;
  isLoading?: boolean;
}

const StartPollButton: React.FC<StartPollButtonProps> = ({
  onStartPoll,
  isPollActive,
  isLoading = false,
}) => {
  const handleClick = async () => {
    if (isPollActive) {
      alert('Опрос уже активен!');
      return;
    }
    await onStartPoll();
  };

  return (
    <button
      className={`${styles.startPollButton} ${isPollActive ? styles.active : ''}`}
      onClick={handleClick}
      disabled={isPollActive || isLoading}
    >
      {isLoading ? (
        <span className={styles.loadingText}>⏳ Запуск...</span>
      ) : isPollActive ? (
        <span className={styles.activeText}>⏳ Опрос активен</span>
      ) : (
        <span className={styles.defaultText}>📊 Начать опрос</span>
      )}
    </button>
  );
};

export default StartPollButton;