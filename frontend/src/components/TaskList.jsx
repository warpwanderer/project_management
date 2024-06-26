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

const fetchPriorities = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/priorities/`, { headers: getAuthHeaders() });
  return response.data;
};

const fetchStatuses = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/statuses/`, { headers: getAuthHeaders() });
  return response.data;
};

const TaskList = ({ columnId, projectId }) => {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useQuery(['tasks', columnId], () => fetchTasks(projectId, columnId));
  const { data: priorities } = useQuery('priorities', fetchPriorities);
  const { data: statuses } = useQuery('statuses', fetchStatuses);

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
    }
  };

  const handleUpdateTask = async (taskId, updatedTaskName, updatedTaskDescription, updatedDueDate, updatedPriority, updatedStatus) => {
    const updatedTask = tasks.find(task => task.id === taskId);
    updatedTask.name = updatedTaskName;
    updatedTask.description = updatedTaskDescription;
    updatedTask.due_date = updatedDueDate;
    updatedTask.priority = updatedPriority;
    updatedTask.status = updatedStatus;
    try {
      await updateTaskMutation.mutateAsync(updatedTask);
    } catch (error) {
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

  const handleSubtaskCreate = async (parentTaskId, subtaskName, subtaskDescription, subtaskDueDate, subtaskPriority, subtaskStatus) => {
    try {
      await addTaskMutation.mutateAsync({
        name: subtaskName,
        description: subtaskDescription,
        due_date: subtaskDueDate,
        priority: subtaskPriority,
        status: subtaskStatus,
        parent_task: parentTaskId,
        column: columnId
      });
    } catch (error) {
    }
  };

  const handleToggleComplete = async (taskId, isCompleted) => {
    const updatedTask = tasks.find(task => task.id === taskId);
    updatedTask.is_completed = isCompleted;
    try {
      await updateTaskMutation.mutateAsync(updatedTask);
    } catch (error) {
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
                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <TaskItem
                        task={task}
                        onDelete={() => handleDeleteTask(task.id)}
                        onUpdate={handleUpdateTask}
                        onSubtaskCreate={handleSubtaskCreate}
                        onToggleComplete={handleToggleComplete}
                        priorities={priorities}
                        statuses={statuses}
                      />
                      {task.subtasks && task.subtasks.length > 0 && (
                        <List
                          dataSource={task.subtasks}
                          renderItem={(subtask) => (
                            <TaskItem
                              key={subtask.id}
                              task={subtask}
                              onDelete={() => handleDeleteTask(subtask.id)}
                              onUpdate={handleUpdateTask}
                              onSubtaskCreate={handleSubtaskCreate}
                              onToggleComplete={handleToggleComplete}
                              priorities={priorities}
                              statuses={statuses}
                            />
                          )}
                        />
                      )}
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
