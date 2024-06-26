import React, { useState, useEffect } from 'react';
import { useParams,} from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Input, Button, message, } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import axios from '../components/axiosInterceptor';
import ColumnSection from '../components/ColumnSection';
import { fetchTasks } from '../components/TaskList'; // Импортируем fetchTasks
import { DragDropContext } from '@hello-pangea/dnd';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const accessToken = Cookies.get('jwt_token');
  const refreshToken = Cookies.get('refresh_token');
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Refresh-Token': refreshToken,
  };
};

const fetchColumns = async (projectId) => {
  const response = await axios.get(`${API_BASE_URL}/api/projects/${projectId}/columns`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const addColumn = async ({ projectId, newColumnTitle }) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/projects/${projectId}/columns`,
    { name: newColumnTitle, project: projectId },
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

const TaskListView = () => {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [inputVisible, setInputVisible] = useState(false);
  

  const { data: columns, error, isLoading } = useQuery(['columns', projectId], () => fetchColumns(projectId), {
    onError: () => {
      message.error('Ошибка при получении колонок. Пожалуйста, попробуйте позже.');
    },
    staleTime: 300000, // 5 минут
  });

  useEffect(() => {
    if (columns) {
      columns.forEach(column => {
        queryClient.prefetchQuery(['tasks', column.id], () => fetchTasks(projectId, column.id));
      });
    }
  }, [columns, projectId, queryClient]);

  const addColumnMutation = useMutation(
    ({ projectId, newColumnTitle }) => addColumn({ projectId, newColumnTitle }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['columns', projectId]);
        setInputVisible(false);
        setNewColumnTitle('');
      },
      onError: (error) => {
        message.error(`Ошибка при добавлении колонки: ${error.response.data.error || error.message}`);
      },
    }
  );

  const handleAddColumn = () => {
    setInputVisible(true);
  };

  const handleColumnTitleChange = (e) => {
    setNewColumnTitle(e.target.value);
  };

  const handleColumnTitleBlur = () => {
    if (newColumnTitle.trim()) {
      addColumnMutation.mutate({ projectId, newColumnTitle });
    } else {
      setInputVisible(false);
    }
  };

  const handleColumnTitleEnter = (e) => {
    if (e.key === 'Enter') {
      handleColumnTitleBlur();
    }
  };

  
 
  return (
    <DragDropContext >
    <div>
      {isLoading ? (
        <div>Загрузка...</div>
      ) : (
      columns.map(column => (
        <ColumnSection key={column.id} column={column} projectId={projectId} />
      ))

      )}
      {inputVisible ? (
        <Input
          style={{ width: '200px', marginTop: 16 }}
          placeholder="Введите название колонки"
          value={newColumnTitle}
          onChange={handleColumnTitleChange}
          onBlur={handleColumnTitleBlur}
          onPressEnter={handleColumnTitleEnter}
          autoFocus
        />
      ) : (
        <Button type="default" onClick={handleAddColumn} style={{ marginTop: 16, marginLeft: '100px' }}>
          <PlusOutlined /> Добавить раздел
        </Button>
      )}
      {error && <div style={{ color: 'red' }}>{error.message}</div>}
    </div>
    </DragDropContext>
  );
};

export default TaskListView;
