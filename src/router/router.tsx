// router.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Login from '../components/pages/login/Login';
import MainStudents from '../components/pages/mainStudents/mainStudents';
import MainTeacher from '../components/pages/mainTeacher/mainTeacher';
import GroupPage from '../components/pages/groupPage/gropePage';
import DisciplinePage from '../../src/components/pages/disciplinePage/disciplinePage';
import PollPage from '../components/pages/PollPage/PollPage'; // ← ДОБАВЛЕНО
import { isAuthenticated, getUserRole } from '../utils/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'student' | 'teacher';
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  console.log('🔒 ProtectedRoute проверка:');
  console.log('  authenticated:', authenticated);
  console.log('  userRole:', userRole);
  console.log('  requiredRole:', role);

  if (!authenticated) {
    console.log('⛔ Не авторизован → /login');
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    console.log(`⛔ Роль ${userRole} != ${role} → /`);
    return <Navigate to="/" replace />;
  }

  console.log('✅ Доступ разрешён');
  return <>{children}</>;
};

export const Router = () => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  console.log('🌐 Router рендерится:');
  console.log('  authenticated:', authenticated);
  console.log('  userRole:', userRole);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          authenticated ? (
            userRole === 'student' ? (
              <Navigate to="/student" replace />
            ) : userRole === 'teacher' ? (
              <Navigate to="/teacher" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ===== СТРАНИЦА СТУДЕНТА ===== */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <MainStudents />
          </ProtectedRoute>
        }
      />

      {/* ===== СТРАНИЦА ДИСЦИПЛИНЫ (ДЛЯ СТУДЕНТА) ===== */}
      <Route
        path="/student/discipline/:disciplineId"
        element={
          <ProtectedRoute role="student">
            <DisciplinePage />
          </ProtectedRoute>
        }
      />

      {/* ===== СТРАНИЦА ОПРОСА (ДЛЯ СТУДЕНТА) ===== */}
      <Route
        path="/student/poll/:pollId"
        element={
          <ProtectedRoute role="student">
            <PollPage />
          </ProtectedRoute>
        }
      />

      {/* ===== СТРАНИЦА ПРЕПОДАВАТЕЛЯ ===== */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <MainTeacher />
          </ProtectedRoute>
        }
      />

      {/* ===== СТРАНИЦА ГРУППЫ (ДЛЯ ПРЕПОДАВАТЕЛЯ) ===== */}
      <Route
        path="/teacher/group/:groupId"
        element={
          <ProtectedRoute role="teacher">
            <GroupPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};