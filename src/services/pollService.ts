// src/services/pollService.ts

const API_URL = '/api';

export interface Poll {
  id: string;
  disciplineId: number;
  teacherId: number;
  groupId: number;
  startedAt: string;
  expiresAt: string;
  active: boolean;
}

export interface PollNotification {
  pollId: string;
  disciplineId: number;
  disciplineName: string;
  teacherName: string;
  expiresAt: string;
}

// Создать опрос
export const createPoll = async (
  disciplineId: number,
  teacherId: number,
  groupId: number
): Promise<Poll> => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

  const newPoll = {
    disciplineId,
    teacherId,
    groupId,
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    active: true,
  };

  const response = await fetch(`${API_URL}/polls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPoll),
  });

  if (!response.ok) {
    throw new Error('Не удалось создать опрос');
  }

  return response.json();
};

// Получить активный опрос для группы и дисциплины
export const getActivePoll = async (
  groupId: number,
  disciplineId: number
): Promise<Poll | null> => {
  const response = await fetch(`${API_URL}/polls?groupId=${groupId}&disciplineId=${disciplineId}&active=true`);
  
  if (!response.ok) {
    throw new Error('Не удалось получить опрос');
  }

  const polls: Poll[] = await response.json();
  const now = new Date();

  const activePolls = polls.filter(poll => {
    const expiresAt = new Date(poll.expiresAt);
    return expiresAt > now;
  });

  return activePolls.length > 0 ? activePolls[0] : null;
};

// Завершить опрос
export const closePoll = async (pollId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/polls/${pollId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: false }),
  });

  if (!response.ok) {
    throw new Error('Не удалось завершить опрос');
  }
};

// Отметить студента как присутствующего
export const markStudentPresent = async (
  studentId: number,
  disciplineId: number,
  pollId: string
): Promise<void> => {
  const pollResponse = await fetch(`${API_URL}/polls/${pollId}`);
  const poll: Poll = await pollResponse.json();

  if (!poll.active) {
    throw new Error('Опрос уже завершён');
  }

  const now = new Date();
  const expiresAt = new Date(poll.expiresAt);
  if (now > expiresAt) {
    throw new Error('Время на отметку истекло');
  }

  const today = now.toISOString().split('T')[0];
  const attendanceResponse = await fetch(
    `${API_URL}/attendance?studentId=${studentId}&disciplineId=${disciplineId}&date=${today}`
  );
  const existingRecords = await attendanceResponse.json();

  if (existingRecords.length > 0) {
    const record = existingRecords[0];
    await fetch(`${API_URL}/attendance/${record.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'П' }),
    });
  } else {
    await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        disciplineId,
        date: today,
        status: 'П',
        reason: 'Отметка по опросу',
      }),
    });
  }
};

// Проверить статус опроса
export const checkPollStatus = async (pollId: string): Promise<Poll> => {
  const response = await fetch(`${API_URL}/polls/${pollId}`);
  if (!response.ok) {
    throw new Error('Не удалось проверить статус опроса');
  }
  return response.json();
};

// Автоматическое завершение опроса
export const autoClosePoll = async (pollId: string): Promise<void> => {
  const poll = await checkPollStatus(pollId);
  if (!poll.active) return;

  const now = new Date();
  const expiresAt = new Date(poll.expiresAt);
  if (now <= expiresAt) return;

  const studentsResponse = await fetch(`${API_URL}/students?groupId=${poll.groupId}`);
  const students = await studentsResponse.json();

  const today = new Date().toISOString().split('T')[0];

  for (const student of students) {
    const attendanceResponse = await fetch(
      `${API_URL}/attendance?studentId=${student.id}&disciplineId=${poll.disciplineId}&date=${today}`
    );
    const existingRecords = await attendanceResponse.json();

    if (existingRecords.length === 0) {
      await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: Number(student.id),
          disciplineId: poll.disciplineId,
          date: today,
          status: 'Н',
          reason: 'Не отметился на опросе',
        }),
      });
    }
  }

  await closePoll(pollId);
};

// Получить активные опросы для студента
export const getActivePollsForStudent = async (studentId: number): Promise<PollNotification[]> => {
  const studentResponse = await fetch(`${API_URL}/students/${studentId}`);
  const student = await studentResponse.json();

  const pollsResponse = await fetch(`${API_URL}/polls?active=true`);
  const polls = await pollsResponse.json();

  const notifications: PollNotification[] = [];

  for (const poll of polls) {
    if (poll.groupId === student.groupId) {
      const discResponse = await fetch(`${API_URL}/disciplines/${poll.disciplineId}`);
      const discipline = await discResponse.json();

      const teacherResponse = await fetch(`${API_URL}/teachers/${poll.teacherId}`);
      const teacher = await teacherResponse.json();

      const now = new Date();
      const expiresAt = new Date(poll.expiresAt);
      if (expiresAt <= now) continue;

      notifications.push({
        pollId: poll.id,
        disciplineId: poll.disciplineId,
        disciplineName: discipline.name,
        teacherName: teacher.fullName,
        expiresAt: poll.expiresAt,
      });
    }
  }

  return notifications;
};