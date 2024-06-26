import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../components/axiosInterceptor';
import { Menu, Layout } from 'antd';
import { ProjectOutlined, HomeOutlined, PlusOutlined, TeamOutlined, CheckCircleOutlined, LineChartOutlined, SignatureOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import CreateTeamForm from './CreateTeamForm';

const { Sider } = Layout;

const Navigation = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [teams, setTeams] = useState([]);

  const accessToken = Cookies.get('jwt_token');
  const refreshToken = Cookies.get('refresh_token');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/projects', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Refresh-Token': refreshToken,
          },
        });

        setProjects(response.data);
      } catch (error) {
        console.error('Ошибка при получении проектов:', error);
      }
    };

    fetchProjects();
  }, [accessToken, refreshToken]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/teams', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Refresh-Token': refreshToken,
          },
        });

        setTeams(response.data);
      } catch (error) {
        console.error('Ошибка при получении команд:', error);
      }
    };

    fetchTeams();
  }, [accessToken, refreshToken]);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
  };


  const location = useLocation();
  const showOnPaths = ['/dashboard', '/projects', '/teams', '/projects', '/tasks', '/reports', '/notes'];

  const shouldShow = () => {
    const path = location.pathname;
    if (showOnPaths.includes(path)) {
      return true;
    }

    if (path.startsWith('/teams/') || path.startsWith('/projects/')) {
      return true;
    }
    return false;
  }
  if (!shouldShow()) {
    return null;
  }

  const projectSubMenu = {
    icon: <Link to="/projects"><ProjectOutlined /></Link>,
    label: <Link to="/projects">Проекты</Link>,
    key: '/projects',
    children: projects.length > 0 ? projects.map(project => ({
      label: <Link to={`/projects/${project.id}/`}>{project.name}</Link>,
      key: `/projects/${project.id}`,
    })) : null,
  };

  const teamSubMenu = {
    icon: <TeamOutlined />,
    label: 'Команды',
    key: '/create-team',
    children: teams.length > 0 ? teams.map(team => ({
      label:
        <Link to={`/teams/${team.id}/`}>{team.name}</Link>,
      key: `/teams/${team.id}`,
    })) : null,
  };

  if (teamSubMenu.children) {
    teamSubMenu.children.push({
      label: (
        <>
          <span onClick={handleShowModal}>
            <PlusOutlined /> Добавить
          </span>
          {showModal && <CreateTeamForm onSuccess={handleFormSuccess} onClose={handleCloseModal} />}
        </>
      ),
      key: '/create-team-button',

    });
  }

  const items = [
    {
      icon: <Link to="/dashboard"><HomeOutlined /></Link>,
      label: <Link to="/dashboard">Главная</Link>,
      key: '/dashboard',
    },
    projectSubMenu,
    {
      icon: <Link to="/tasks"><CheckCircleOutlined /></Link>,
      label: <Link to="/tasks">Задачи</Link>,
      key: '/tasks',
    },

    teamSubMenu,
    {
      icon: <Link to="/reports"><LineChartOutlined /></Link>,
      label: <Link to="/reports">Отчеты</Link>,
      key: '/reports',
    },
    {
      icon: <Link to="/notes"><SignatureOutlined /></Link>,
      label: <Link to="/notes">Личные записи</Link>,
      key: '/notes',
    },


  ];

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light">
      <Menu
        mode="inline"
        items={items}
        selectedKeys={[location.pathname]}
        style={{ width: collapsed ? 45 : 180, transition: 'width 0.2s', paddingTop: 10 }}
      />
    </Sider>
  );
};

export default Navigation;
