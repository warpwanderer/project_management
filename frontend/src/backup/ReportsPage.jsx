import React, { useState, useEffect } from 'react';
import { Table, Card, Statistic, Row, Col, Select, Button } from 'antd';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import Cookies from 'js-cookie';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement);

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const accessToken = Cookies.get('jwt_token');
  const refreshToken = Cookies.get('refresh_token');
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Refresh-Token': refreshToken,
  };
};

const ReportsPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('pie');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/reports/`, {
          headers: getAuthHeaders(),
        });
        setTasks(response.data.tasks);
        setProjects(response.data.projects);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data', error);
        setLoading(false);
      }
    };

    const fetchFilters = async () => {
      try {
        const [statusResponse, priorityResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/statuses/`, { headers: getAuthHeaders() }),
          axios.get(`${API_BASE_URL}/api/priorities/`, { headers: getAuthHeaders() })
        ]);
        setStatuses(statusResponse.data);
        setPriorities(priorityResponse.data);
      } catch (error) {
        console.error('Error fetching filters', error);
      }
    };

    fetchData();
    fetchFilters();
  }, []);

  const handleFilterChange = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/filter-tasks/`, {
        headers: getAuthHeaders(),
        params: {
          project: selectedProject,
          status: selectedStatus,
          priority: selectedPriority
        }
      });
      setTasks(response.data.tasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching filtered data', error);
      setLoading(false);
    }
  };

  const exportTasks = () => {
    window.location.href = `${API_BASE_URL}/api/export-tasks/`;
  };

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(item => item.is_completed).length;
  const remainingTasks = totalTasks - completedTasks;

  const pieChartData = {
    labels: ['Выполненные задачи', 'Оставшиеся задачи'],
    datasets: [
      {
        data: [completedTasks, remainingTasks],
        backgroundColor: ['#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#36A2EB', '#FFCE56'],
      },
    ],
  };

  const lineChartData = {
    labels: projects.map(project => project.name),
    datasets: [
      {
        label: 'Количество задач',
        data: projects.map(project => tasks.filter(task => task.project === project.id).length),
        borderColor: '#36A2EB',
        fill: false,
      },
    ],
  };

  const barChartData = {
    labels: statuses.map(status => status.name),
    datasets: [
      {
        label: 'Количество задач по статусам',
        data: statuses.map(status => tasks.filter(task => task.status === status.id).length),
        backgroundColor: '#36A2EB',
      },
      {
        label: 'Количество задач по приоритетам',
        data: priorities.map(priority => tasks.filter(task => task.priority === priority.id).length),
        backgroundColor: '#FFCE56',
      }
    ],
  };

  const columns = [
    {
      title: 'Проект',
      dataIndex: 'project_name',
      key: 'project_name',
    },
    {
      title: 'Задача',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Назначено',
      dataIndex: 'assigned_to_name',
      key: 'assigned_to_name',
    },
    {
      title: 'Статус',
      dataIndex: 'status_name',
      key: 'status_name',
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority_name',
      key: 'priority_name',
    },
    {
      title: 'Срок',
      dataIndex: 'due_date',
      key: 'due_date',
      render: text => new Date(text).toLocaleDateString(),
    },
  ];

  const renderChart = () => {
    if (selectedChart === 'pie') {
      return <Pie data={pieChartData} />;
    }
    if (selectedChart === 'line') {
      return <Line data={lineChartData} />;
    }
    if (selectedChart === 'bar') {
      return <Bar data={barChartData} />;
    }
    return null;
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Общее количество проектов" value={totalProjects} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Общее количество задач" value={totalTasks} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Выполненные задачи" value={completedTasks} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '20px' }}>
        <Col span={24} style={{ marginBottom: '20px' }}>
          <Select
            placeholder="Выберите проект"
            style={{ width: 200, marginRight: '10px' }}
            onChange={value => setSelectedProject(value)}
            allowClear
          >
            {projects.map(project => (
              <Select.Option key={project.id} value={project.id}>
                {project.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Выберите статус"
            style={{ width: 200, marginRight: '10px' }}
            onChange={value => setSelectedStatus(value)}
            allowClear
          >
            {statuses.map(status => (
              <Select.Option key={status.id} value={status.id}>
                {status.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Выберите приоритет"
            style={{ width: 200, marginRight: '10px' }}
            onChange={value => setSelectedPriority(value)}
            allowClear
          >
            {priorities.map(priority => (
              <Select.Option key={priority.id} value={priority.id}>
                {priority.name}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleFilterChange}>
            Применить фильтры
          </Button>
          <Button type="default" onClick={exportTasks} style={{ marginLeft: '10px' }}>
            Экспорт в CSV
          </Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '20px' }}>
        <Col span={16}>
          <Table
            dataSource={tasks}
            columns={columns}
            loading={loading}
            rowKey="id"
          />
        </Col>
        <Col span={8} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Select defaultValue="pie" style={{ width: 200, marginBottom: '20px' }} onChange={setSelectedChart}>
            <Select.Option value="pie">Круговая диаграмма</Select.Option>
            <Select.Option value="line">Линейный график</Select.Option>
            <Select.Option value="bar">Столбчатая диаграмма</Select.Option>
          </Select>
          <div style={{ width: '100%', height: '100%' }}>
            {renderChart()}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsPage;
