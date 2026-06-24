// src/components/pages/login/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.scss';
import logo from '../../../assets/logo.png';

import Button from '../../ui/button/button';
import Input from '../../ui/input/input';
import Label from '../../ui/label/label';

import { authenticateUser, generateToken } from '../../../services/authService';
import { setAuth } from '../../../utils/auth';

interface LoginProps {
  commentColor?: string;
  logo?: React.ReactNode;
}

const Login: React.FC<LoginProps> = ({ 
  commentColor = 'var(--present)', 
  logo: logoProp 
}) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('📝 ШАГ 1: Отправка формы');
    console.log('📝 Логин:', login);
    console.log('📝 Пароль:', password);

    try {
      console.log('📝 ШАГ 2: Вызов authenticateUser');
      const user = await authenticateUser(login, password);
      console.log('📝 ШАГ 3: Результат authenticateUser:', user);

      if (!user) {
        console.log('❌ ШАГ 4: Пользователь НЕ найден');
        setError('Неверный логин или пароль');
        setLoading(false);
        return;
      }

      console.log('✅ ШАГ 4: Пользователь найден:', user);

      console.log('📝 ШАГ 5: Генерация токена');
      const token = generateToken();
      console.log('📝 Токен:', token);

      console.log('📝 ШАГ 6: Сохранение через setAuth');
      setAuth(user, token);

      console.log('📝 ШАГ 7: Проверка localStorage');
      console.log('📦 token:', localStorage.getItem('token'));
      console.log('📦 role:', localStorage.getItem('role'));
      console.log('📦 userName:', localStorage.getItem('userName'));

      const redirectPath = user.role === 'student' ? '/student' : '/teacher';
      console.log('📝 ШАГ 8: Перенаправление на:', redirectPath);
      
      // Перенаправляем
      navigate(redirectPath);
      console.log('✅ ШАГ 9: navigate вызван');
      
    } catch (error) {
      console.error('💥 ОШИБКА:', error);
      setError('Не удалось подключиться к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.spacer} />
        
        <div className={styles.logo}>
          {logoProp || <img src={logo} alt="Логотип" />}
        </div>
        
        <h1 className={styles.title}>Посещаемость студентов</h1>
        
        <p className={styles.comment} style={{ color: commentColor }}>
          Войдите в систему для отслеживания посещаемости
        </p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.fieldsContainer}>
          <Label htmlFor="login">Логин</Label>
          <Input
            id="login"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Введите логин (1 или 2)"
            required
            disabled={loading}
          />

          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль (1 или 2)"
            required
            disabled={loading}
          />
        </div>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : 'Войти'}
        </Button>
        
      </form>
    </div>
  );
};

export default Login;