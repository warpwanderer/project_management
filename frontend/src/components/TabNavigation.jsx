import React from 'react';
import { Tabs } from 'antd';
import { useLocation } from 'react-router-dom';
import ProjectColumns from 'pages/BoardTaskPage';
import TaskListView from 'pages/TaskListView';
import { UnorderedListOutlined, ProjectOutlined, CalendarOutlined} from '@ant-design/icons';
import ProjectCalendar from 'pages/ProjectCalendar';

const TabNavigation = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab');

  const getDefaultActiveKey = () => {
    switch (tab) {
      case 'list':
        return '1';
      case 'board':
        return '2';
      default:
        return '2'; // Default to "Board" tab
    }
  };

  const items = [
    {
      icon: <UnorderedListOutlined />,
      key: '1',
      label: 'Список',
      children: <TaskListView />,
    },
    {
      icon: <ProjectOutlined />,
      key: '2',
      label: 'Доски',
      children: <ProjectColumns />,
    },
    {
      icon: <CalendarOutlined />,
      key: '3',
      label: 'Календарь',
      children: <ProjectCalendar />,
    },
  ];

  return <Tabs defaultActiveKey={getDefaultActiveKey()} items={items} />;
};

export default TabNavigation;
