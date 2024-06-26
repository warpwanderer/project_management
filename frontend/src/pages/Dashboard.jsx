import React, { useState, useEffect } from 'react';
import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from '../components/axiosInterceptor';
import InvitationsList from 'components/InvitationsList';
import AccountManagement from 'components/AccountManagement';
import './Dashboard.css';

const { Title } = Typography;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
    const accessToken = Cookies.get('jwt_token');
    const refreshToken = Cookies.get('refresh_token');
    return {
        Authorization: `Bearer ${accessToken}`,
        'X-Refresh-Token': refreshToken,
    };
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/reports`, {
                    headers: getAuthHeaders(),
                });
                setProjects(response.data.projects);
                setTasks(response.data.tasks);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
               
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000); // Обновляем каждую секунду

        return () => clearInterval(interval);
    }, []); 

    const formatDateTime = (dateTime) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric' };
        const formattedDateTime = dateTime.toLocaleDateString('ru-RU', options);
        const trimmedDateTime = formattedDateTime.replace('в', '');
        return trimmedDateTime;
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const { username, email } = JSON.parse(userData);
            setUsername(username);
            setEmail(email);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        Cookies.remove('jwt_token');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <center>
                <h3>{formatDateTime(currentDateTime)}</h3>
                <Title level={2}>Добрый день, {username.charAt(0).toUpperCase() + username.slice(1)}</Title>
            </center>
            <div className="dashboard-content">
                <div>
                    <h3>Проекты:</h3>
                    <ul>
                        {projects.map(project => (
                            <li key={project.id}>{project.name}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3>Задачи:</h3>
                    <ul>
                        {tasks.map(task => (
                            <li key={task.id}>{task.name}</li>
                        ))}
                    </ul>
                </div>
                <InvitationsList />
                <Button type="primary" onClick={() => setIsEditing(true)}>Редактировать профиль</Button>
                <Button danger onClick={() => setIsDeleting(true)}>Удалить аккаунт</Button>
                <Button type="default" onClick={handleLogout}>Выйти</Button>
            </div>

            <AccountManagement
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                isDeleting={isDeleting}
                setIsDeleting={setIsDeleting}
                username={username}
                setUsername={setUsername}
                email={email}
                setEmail={setEmail}
            />
        </div>
    );
};

export default Dashboard;
