import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { Card, Input, message } from 'antd';
import { CloseSquareOutlined } from '@ant-design/icons';
import TaskList, { fetchTasks } from './TaskList';
import axios from './axiosInterceptor';
import Cookies from 'js-cookie';
import { Droppable } from '@hello-pangea/dnd';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const accessToken = Cookies.get('jwt_token');
  const refreshToken = Cookies.get('refresh_token');
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Refresh-Token': refreshToken,
  };
};

const deleteColumn = async ({ projectId, columnId }) => {
  const response = await axios.delete(
    `${API_BASE_URL}/api/projects/${projectId}/columns/${columnId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

const updateColumn = async ({ projectId, selectedColumn }) => {
  const response = await axios.put(
    `${API_BASE_URL}/api/projects/${projectId}/columns/${selectedColumn.id}`,
    selectedColumn,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

const updateTaskOrder = async (projectId, tasksOrder) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/projects/${projectId}/tasks/update-order/`,
    { order: tasksOrder },
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

const Column = ({ column, projectId }) => {
  const queryClient = useQueryClient();
  const [selectedColumn, setSelectedColumn] = useState(null);

  const { data: tasks, isLoading: isTasksLoading } = useQuery(['tasks', column.id], () => fetchTasks(projectId, column.id));

  const deleteColumnMutation = useMutation(
    ({ projectId, columnId }) => deleteColumn({ projectId, columnId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['columns', projectId]);
      },
      onError: (error) => {
        message.error(`Ошибка при удалении колонки: ${error.response.data.error || error.message}`);
      },
    }
  );

  const updateColumnMutation = useMutation(
    ({ projectId, selectedColumn }) => updateColumn({ projectId, selectedColumn }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['columns', projectId]);
        setSelectedColumn(null);
      },
      onError: (error) => {
        message.error(`Ошибка при обновлении колонки: ${error.response.data.error || error.message}`);
      },
    }
  );

  const handleDeleteColumn = useCallback((columnId) => {
    deleteColumnMutation.mutate({ projectId, columnId });
  }, [deleteColumnMutation, projectId]);

  const handleEditColumn = useCallback(() => {
    if (selectedColumn?.name.trim()) {
      updateColumnMutation.mutate({ projectId, selectedColumn });
    }
  }, [selectedColumn, updateColumnMutation, projectId]);

  const handleColumnNameClick = useCallback((column) => {
    setSelectedColumn(column);
  }, []);

  const handleModalChange = useCallback((field, value) => {
    setSelectedColumn((prevColumn) => ({ ...prevColumn, [field]: value }));
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceColumnId = result.source.droppableId.split('-')[1];
    const destinationColumnId = result.destination.droppableId.split('-')[1];

    const sourceTasks = Array.from(tasks);
    const [movedTask] = sourceTasks.splice(result.source.index, 1);

    if (sourceColumnId === destinationColumnId) {
      sourceTasks.splice(result.destination.index, 0, movedTask);
    } else {
      const destinationTasks = Array.from(tasks[destinationColumnId]);
      destinationTasks.splice(result.destination.index, 0, movedTask);
      tasks[destinationColumnId] = destinationTasks;
    }

    tasks[sourceColumnId] = sourceTasks;

    const tasksOrder = tasks.flatMap((taskList, columnId) =>
      taskList.map((task, index) => ({
        id: task.id,
        order: index + 1,
        column: columnId,
      }))
    );

    updateTaskOrder(projectId, tasksOrder)
      .then(() => {
        queryClient.invalidateQueries(['tasks', sourceColumnId]);
        queryClient.invalidateQueries(['tasks', destinationColumnId]);
        message.success('Порядок задач успешно обновлен');
      })
      .catch((error) => {
        message.error(`Ошибка при обновлении порядка задач: ${error.response?.data?.error || error.message}`);
      });
  };

  return (
    <div style={{ margin: '50px 20px' }}>
      <Card size="default">
        {selectedColumn?.id === column.id ? (
          <Input
            style={{ width: '100%' }}
            value={selectedColumn.name}
            onChange={(e) => handleModalChange('name', e.target.value)}
            onBlur={handleEditColumn}
            onPressEnter={handleEditColumn}
            autoFocus
          />
        ) : (
          <h3>
            <span onClick={() => handleColumnNameClick(column)}>{column.name}</span>
            <CloseSquareOutlined onClick={() => handleDeleteColumn(column.id)} style={{ marginLeft: 5, float: 'right', cursor: 'pointer' }} />
          </h3>
        )}
        <Droppable droppableId={`tasks-${column.id}`} type="TASK" >
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {isTasksLoading ? (
                <div>Загрузка задач...</div>
              ) : (
                <TaskList columnId={column.id} projectId={projectId} tasks={tasks} />
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Card>
    </div>
  );
};

export default Column;
