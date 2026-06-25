// src/services/notificationService.ts
import type { PollNotification } from './pollService'; // ← добавили type

let notificationListeners: ((notification: PollNotification) => void)[] = [];

export const addNotificationListener = (listener: (notification: PollNotification) => void) => {
  notificationListeners.push(listener);
  return () => {
    notificationListeners = notificationListeners.filter(l => l !== listener);
  };
};

export const sendPollNotification = (notification: PollNotification) => {
  notificationListeners.forEach(listener => listener(notification));
};

// Проверка активных опросов для студента
export const checkStudentPolls = async (studentId: number): Promise<PollNotification[]> => {
  const response = await fetch(`/api/polls?active=true`);
  const polls = await response.json();

  // Получаем студента
  const studentResponse = await fetch(`/api/students/${studentId}`);
  const student = await studentResponse.json();

  const notifications: PollNotification[] = [];

  for (const poll of polls) {
    // Проверяем, принадлежит ли студент к этой группе
    if (poll.groupId === student.groupId) {
      // Получаем дисциплину
      const discResponse = await fetch(`/api/disciplines/${poll.disciplineId}`);
      const discipline = await discResponse.json();

      // Получаем преподавателя
      const teacherResponse = await fetch(`/api/teachers/${poll.teacherId}`);
      const teacher = await teacherResponse.json();

      notifications.push({
        pollId: poll.id,
        disciplineName: discipline.name,
        teacherName: teacher.fullName,
        expiresAt: poll.expiresAt,
      });
    }
  }

  return notifications;
};