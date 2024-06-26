import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, momentLocalizer, } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ru';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Modal, Input, Tag, message, Select } from 'antd';
import axios from '../components/axiosInterceptor';
import Cookies from 'js-cookie';
import 'react-big-calendar/lib/css/react-big-calendar.css';


const localizer = momentLocalizer(moment);

const messages = {
    allDay: 'Весь день',
    previous: 'Предыдущий',
    next: 'Следующий',
    today: 'Сегодня',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    agenda: 'Повестка дня',
    date: 'Дата',
    time: 'Время',
    event: 'Событие',
    showMore: (total) => `+ (${total}) Событий`,
};

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

const fetchTasks = async (projectId, columnId) => {
    const response = await axios.get(`${API_BASE_URL}/api/projects/${projectId}/columns/${columnId}/tasks/`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

const addTask = async ({ projectId, columnId, newTask }) => {
    const response = await axios.post(
        `${API_BASE_URL}/api/projects/${projectId}/columns/${columnId}/tasks/`,
        newTask,
        {
            headers: getAuthHeaders(),
        }
    );
    return response.data;
};

const updateTask = async ({ projectId, columnId, taskId, updatedTask }) => {
    const response = await axios.put(
        `${API_BASE_URL}/api/projects/${projectId}/columns/${columnId}/tasks/${taskId}/`,
        updatedTask,
        {
            headers: getAuthHeaders(),
        }
    );
    return response.data;
};

const ProjectCalendar = () => {
    const { projectId } = useParams();
    const queryClient = useQueryClient();
    const [tasks, setTasks] = useState([]);
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState(null);
    const [selectedColumnId, setSelectedColumnId] = useState(null);

    const fetchAllTasks = async (projectId) => {
        const columns = await fetchColumns(projectId);
        setColumns(columns);

        const tasksPromises = columns.map(column => fetchTasks(projectId, column.id));
        const tasksResults = await Promise.all(tasksPromises);
        const allTasks = tasksResults.flat().map(task => ({
            ...task,
            start: new Date(task.due_date),
            end: new Date(task.due_date),
            title: task.name,
            column: columns.find(col => col.id === task.column)
        }));
        setTasks(allTasks);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAllTasks(projectId);
    }, [projectId]);

    const addTaskMutation = useMutation(
        ({ projectId, columnId, newTask }) => addTask({ projectId, columnId, newTask }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['tasks', projectId]);
                fetchAllTasks(projectId); 
                setIsModalVisible(false);
                setNewTaskTitle('');
                setNewTaskDate(null);
                setSelectedColumnId(null);
            },
            onError: (error) => {
                message.error(`Ошибка при добавлении задачи: ${error.response.data.error || error.message}`);
            },
        }
    );

    const updateTaskMutation = useMutation(
        ({ projectId, columnId, taskId, updatedTask }) => updateTask({ projectId, columnId, taskId, updatedTask }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['tasks', projectId]);
                fetchAllTasks(projectId); 
            },
            onError: (error) => {
                message.error(`Ошибка при обновлении задачи: ${error.response.data.error || error.message}`);
            },
        }
    );

    const handleSelectSlot = ({ start }) => {
        setNewTaskDate(start);
        setIsModalVisible(true);
    };

    const handleAddTask = () => {
        if (newTaskTitle.trim() && newTaskDate && selectedColumnId) {
            const newTask = { name: newTaskTitle, due_date: newTaskDate, column: selectedColumnId };
            addTaskMutation.mutate({ projectId, columnId: selectedColumnId, newTask });
        } else {
            message.error('Пожалуйста, заполните все поля');
        }
    };

    const handleEventDrop = ({ event, start }) => {
        const updatedTask = { ...event, due_date: start };
        updateTaskMutation.mutate({ projectId, columnId: event.column.id, taskId: event.id, updatedTask });
    };

    return (
        <div>
            {isLoading ? (
                <div>Загрузка...</div>
            ) : (
                <Calendar
                    localizer={localizer}
                    messages={messages}
                    events={tasks}
                    startAccessor="start"
                    endAccessor="end"
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onEventDrop={handleEventDrop}
                    style={{ height: 500 }}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: event.column ? event.column.color : '#3174ad',
                        },

                    })}
                    components={{
                        event: ({ event }) => (
                            <span>
                                {event.title}
                                {event.column && <Tag color={event.column.color} style={{ marginLeft: 10 }}>{event.column.name}</Tag>}
                            </span>
                        ),
                    }}
                />
            )}
            <Modal
                title="Добавить новую задачу"
                open={isModalVisible}
                onOk={handleAddTask}
                onCancel={() => setIsModalVisible(false)}
            >
                <Input
                    placeholder="Название задачи"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <div style={{ marginTop: 16 }}>
                    <span>Дата выполнения: {newTaskDate ? newTaskDate.toLocaleDateString() : 'Не выбрано'}</span>
                </div>
                <Select
                    placeholder="Выберите колонку"
                    value={selectedColumnId}
                    onChange={(value) => setSelectedColumnId(value)}
                    style={{ width: '100%', marginTop: 16 }}
                >
                    {columns.map(column => (
                        <Select.Option key={column.id} value={column.id}>{column.name}</Select.Option>
                    ))}
                </Select>
            </Modal>
        </div>
    );
};

export default ProjectCalendar;
