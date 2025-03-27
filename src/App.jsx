
import React, { useState, useEffect } from 'react';

function App() {
  const [completedUsers, setCompletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAndProcessUsers() {
      try {
        const tasks = await fetchTasks();
        const taskCompletion = processTasks(tasks);
        const completedUserIds = findCompletedUserIds(taskCompletion);
        const users = await fetchUsers(completedUserIds);
        setCompletedUsers(users.sort(sortUsers));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAndProcessUsers();
  }, []);

  async function fetchTasks() {
    const response = await fetch('https://nextjs-boilerplate-five-plum-29.vercel.app/api/tasks');
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  }

  function processTasks(tasks) {
    const taskCompletion = {};
    tasks.forEach((task) => {
      if (!taskCompletion[task.userId]) {
        taskCompletion[task.userId] = { completed: true, count: 0 };
      }
      if (!task.completed) {
        taskCompletion[task.userId].completed = false;
      } else {
        taskCompletion[task.userId].count++;
      }
    });
    return taskCompletion;
  }

  function findCompletedUserIds(taskCompletion) {
    return Object.keys(taskCompletion).filter(
      (userId) => taskCompletion[userId].completed
    );
  }

  async function fetchUsers(userIds) {
    const userPromises = userIds.map(async (userId) => {
      const response = await fetch(
        `https://nextjs-boilerplate-five-plum-29.vercel.app/api/users/${userId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch user ${userId}`);
      }
      return response.json();
    });
    return Promise.all(userPromises);
  }

  function sortUsers(a, b) {
    return a.name.localeCompare(b.name);
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {completedUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;