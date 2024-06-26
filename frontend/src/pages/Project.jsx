import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { Link } from 'react-router-dom';
import { Card, List, Spin, Alert, Button, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UnorderedListOutlined, ProjectOutlined} from '@ant-design/icons';
import Cookies from 'js-cookie';
import CreateProjectModal from 'components/CreateProjectModal';
import EditProjectModal from 'components/EditProjectModal';
// import Navigation from 'components/Navigation';

const UserProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const accessToken = Cookies.get('jwt_token');
      const refreshToken = Cookies.get('refresh_token');

      if (!accessToken || !refreshToken) {
        setError('Ошибка аутентификации. Пожалуйста, войдите снова.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://127.0.0.1:8000/api/projects', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Refresh-Token': refreshToken,
        },
      });

      if (response.status === 200) {
        const data = response.data;
        setProjects(data);
      } else {
        setError('Ошибка при получении проектов. Пожалуйста, попробуйте позже.');
      }
    } catch (error) {
      setError('Произошла ошибка. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (values) => {
    try {
      const accessToken = Cookies.get('jwt_token');
      const refreshToken = Cookies.get('refresh_token');

      const response = await axios.post('http://127.0.0.1:8000/api/projects/', values, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Refresh-Token': refreshToken,
        },
      });

      if (response.status === 201) {
        fetchProjects(); // Обновляем список проектов
        setCreateModalVisible(false); // Закрываем модальное окно
      } else {
        setError('Ошибка при создании проекта. Пожалуйста, попробуйте позже.');
      }
    } catch (error) {
      setError('Произошла ошибка. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.');
    }
  };

  const handleEditProject = async (values) => {
    try {
      const accessToken = Cookies.get('jwt_token');
      const refreshToken = Cookies.get('refresh_token');

      const response = await axios.patch(`http://127.0.0.1:8000/api/projects/${selectedProject.id}/`, values, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Refresh-Token': refreshToken,
        },
      });

      if (response.status === 200) {
        fetchProjects(); // Обновляем список проектов
        setEditModalVisible(false); // Закрываем модальное окно
      } else {
        setError('Ошибка при создании проекта. Пожалуйста, попробуйте позже.');
      }
    } catch (error) {
      setError('Произошла ошибка. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const accessToken = Cookies.get('jwt_token');
      const refreshToken = Cookies.get('refresh_token');

      const response = await axios.delete(`http://127.0.0.1:8000/api/projects/${projectId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Refresh-Token': refreshToken,
        },
      });

      if (response.status === 204) {
        fetchProjects();
        // Обновляем список проектов
        message.success('Проект успешно удален');
      } else {
        setError('Ошибка при удалении проекта. Пожалуйста, попробуйте позже.');
      }
    } catch (error) {
      setError('Произошла ошибка. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {error && <Alert message={error} type="error" closable />}
      <Spin spinning={loading}></Spin>
      <h2>Ваши проекты:</h2>
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={projects}
        renderItem={project => (
          <List.Item>
            <Card title={project.name}
              extra={
                <>
                  <Button onClick={() => {
                    setSelectedProject(project); // Установка выбранного проекта при нажатии на кнопку
                    setEditModalVisible(true);
                  }}
                    style={{ marginLeft: 8, cursor: 'pointer' }}
                  ><EditOutlined /></Button>
                  <Button onClick={() => handleDeleteProject(project.id)} style={{ marginLeft: 8, cursor: 'pointer' }}><DeleteOutlined /></Button>
                </>
              }
            >
              <p><strong>Описание:</strong> {project.description}</p>
              <p><strong>Владелец:</strong> {project.created_by_username}</p>
              <p><strong>Команда:</strong> {project.team_name}</p>
              
              <Button href={`/projects/${project.id}?tab=board`}>
              <ProjectOutlined />   Доска
              </Button>
              <Button href={`/projects/${project.id}?tab=list`} style={{ marginLeft: 4}} >
              <UnorderedListOutlined /> Список
              </Button>
              {/* <List
                itemLayout="horizontal"
                dataSource={project.teams}
                renderItem={member => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={member.avatar_url} />}
                      title={member.name}
                      description={member.role}
                    />
                  </List.Item>
                )}
              /> */}
            </Card>
          </List.Item>
        )}
      />

      <Button type="default" onClick={() => setCreateModalVisible(true)} style={{ marginTop: 6 }}><PlusOutlined />  Создать проект</Button>

      <CreateProjectModal
        visible={createModalVisible}
        onCreate={handleCreateProject}
        onCancel={() => setCreateModalVisible(false)}
      />
      {selectedProject && (
        <EditProjectModal
          visible={editModalVisible}
          project={selectedProject} // Передаем выбранный проект в модальное окно
          onUpdate={handleEditProject}
          onCancel={() => setEditModalVisible(false)}
        />
      )}
    </div>
  );
};

export default UserProjects;
