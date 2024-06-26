
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { List, message, Input } from 'antd';
import TaskItem from './TaskItem';
import axios from './axiosInterceptor';
import Cookies from 'js-cookie';
import { Draggable, Droppable } from '@hello-pangea/dnd';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const accessToken = Cookies.get('jwt_token');
  const refreshToken = Cookies.get('refresh_token');
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Refresh-Token': refreshToken,
  };
};

const fetchTasks = async (projectId, columnId) => {
  const response = await axios.get(`${API_BASE_URL}/api/projects/${projectId}/columns/${columnId}/tasks/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const TaskList = ({ columnId, projectId }) => {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useQuery(['tasks', columnId], () => fetchTasks(projectId, columnId));

  const [newTaskName, setNewTaskName] = useState('');

  const deleteTaskMutation = useMutation(
    taskId => axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`, { headers: getAuthHeaders() }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks', columnId]);
        message.success('Задача успешно удалена');
      },
      onError: (error) => {
        message.error(`Ошибка при удалении задачи: ${error.response.data.error || error.message}`);
      },
    }
  );

  const updateTaskMutation = useMutation(
    task => axios.patch(`${API_BASE_URL}/api/projects/${projectId}/columns/${columnId}/tasks/${task.id}`, task, { headers: getAuthHeaders() }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks', columnId]);
        message.success('Задача успешно обновлена');
      },
      onError: (error) => {
        message.error(`Ошибка при обновлении задачи: ${error.response.data.error || error.message}`);
      },
    }
  );

  const addTaskMutation = useMutation(
    newTask => axios.post(`${API_BASE_URL}/api/projects/${projectId}/columns/${columnId}/tasks/`, newTask, { headers: getAuthHeaders() }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks', columnId]);
        message.success('Задача успешно создана');
        setNewTaskName('');
      },
      onError: (error) => {
        message.error(`Ошибка при создании задачи: ${error.response.data.error || error.message}`);
      },
    }
  );

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
    } catch (error) {
      // Error handling is already being done in deleteTaskMutation
    }
  };

  const handleUpdateTask = async (taskId, updatedTaskName, updatedTaskDescription, updatedDueDate) => {
    const updatedTask = tasks.find(task => task.id === taskId);
    updatedTask.name = updatedTaskName;
    updatedTask.description = updatedTaskDescription;
    updatedTask.due_date = updatedDueDate;
    try {
      await updateTaskMutation.mutateAsync(updatedTask);
    } catch (error) {
      // Error handling is already being done in updateTaskMutation
    }
  };

  const handleTaskNameChange = (e) => {
    setNewTaskName(e.target.value);
  };

  const handleTaskNameBlur = () => {
    if (newTaskName.trim() !== '') {
      addTaskMutation.mutate({ name: newTaskName, description: '', column: columnId });
    }
  };

  if (isLoading) return <div>Загрузка задач...</div>;

  return (
    <>
      <Droppable droppableId={`task-list-${columnId}`} type="TASK">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <List
              dataSource={tasks}
              renderItem={(task, index) => (
                <Draggable key={task.id} draggableId={task.id.toString()} index={index} >
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <TaskItem
                        task={task}
                        onDelete={() => handleDeleteTask(task.id)}
                        onUpdate={handleUpdateTask}
                      />
                    </div>
                  )}
                </Draggable>
              )}
            />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <Input
        placeholder="Введите название задачи"
        value={newTaskName}
        onChange={handleTaskNameChange}
        onBlur={handleTaskNameBlur}
        onPressEnter={handleTaskNameBlur}
      />
    </>
  );
};

export { fetchTasks };
export default TaskList;