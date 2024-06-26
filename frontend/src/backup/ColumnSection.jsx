import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { Input, message, Collapse } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from './axiosInterceptor';
import Cookies from 'js-cookie';
import TaskList from './TaskList';
import '../pages/styles.css'

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
  const response = await axios.patch(
    `${API_BASE_URL}/api/projects/${projectId}/columns/${selectedColumn.id}`,
    selectedColumn,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};



const ColumnSection = ({ column, projectId }) => {
  const queryClient = useQueryClient();
  const [selectedColumn, setSelectedColumn] = useState(null);


  const { data: tasks, isLoading } = useQuery(['tasks', column.id], () => fetchTasks(projectId, column.id));

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

  const items = [
    {
      key: column.id,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {selectedColumn?.id === column.id ? (
            <Input
              style={{ width: '30%' }}
              value={selectedColumn.name}
              onChange={(e) => handleModalChange('name', e.target.value)}
              onBlur={handleEditColumn}
              onPressEnter={handleEditColumn}
              autoFocus
            />
          ) : (
            <>
              <span onClick={() => handleColumnNameClick(column)}>{column.name}</span>
              <DeleteOutlined onClick={() => handleDeleteColumn(column.id)} style={{ marginLeft: 8, cursor: 'pointer' }} />
            </>
          )}
        </div>
      ),
      children: (
        <>
          {isLoading ? (
            <div>Загрузка задач...</div>
          ) : (
            <TaskList columnId={column.id} projectId={projectId} />
          )}

        </>
      ),
    },
  ];

  return (
    <Collapse defaultActiveKey={[column.id]} onChange={() => { }} style={{ width: '85%', marginLeft: '100px', marginTop: '10px' }} items={items} />
  );
};




export default ColumnSection;
