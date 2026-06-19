// src/components/Login.tsx
import React, { useState } from 'react';
import styles from './Login.module.css';
interface LoginProps {
  commentColor?: string;
  logo?: React.ReactNode;
}
const Login: React.FC<LoginProps> = ({ commentColor = '#ff0000', logo }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Логин:', login);
    console.log('Пароль:', password);
    // Здесь будет ваш запрос к API
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>
          {logo || <span>Здесь будет логотип</span>}
        </div>
        <h1 className={styles.title}>Посещаемость студентов</h1>
        <p className={styles.comment} style={{ color: commentColor }}>
        Войдите в систему для отметки или просмотра
        </p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>Логин</label>
        <input
          type="text"
          className={styles.input}
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Введите логин"
          required
        />
        <label className={styles.label}>Пароль</label>
        <input
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите пароль"
          required
        />
        <button type="submit" className={styles.button}>
          Войти
        </button>
      </form>
    </div>
  );
};
export default Login;
