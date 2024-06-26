import React, { useEffect, useState, useCallback } from 'react';
import { Card, Col, Row, Input, List, Button, message } from 'antd';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ru';
import Cookies from 'js-cookie';
import TaskItem from 'components/TaskItem'; 

moment.locale('ru');

const daysOfWeek = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье', 'будущее'];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
    const accessToken = Cookies.get('jwt_token');
    const refreshToken = Cookies.get('refresh_token');
    return {
        Authorization: `Bearer ${accessToken}`,
        'X-Refresh-Token': refreshToken,
    };
};

const TaskBoard = () => {
    const [tasks, setTasks] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentWeek, setCurrentWeek] = useState(0);

    const fetchTasksForWeek = useCallback((weekOffset) => {
        setLoading(true);
        axios.get(`${API_BASE_URL}/api/tasks/`, {
            headers: getAuthHeaders(),
        })
        .then(response => {
            const targetWeek = moment().add(weekOffset, 'weeks').week();
            const tasks = response.data.reduce((acc, task) => {
                const taskWeek = moment(task.due_date).week();
                if (taskWeek === targetWeek) {
                    const day = moment(task.due_date).locale('ru').format('dddd');
                    if (daysOfWeek.includes(day)) {
                        acc[day] = acc[day] ? [...acc[day], task] : [task];
                    }
                }
                return acc;
            }, {});
            console.log('Fetched tasks:', tasks);
            setTasks(tasks);
            setLoading(false);
        })
        .catch(error => {
            console.error(error);
            message.error('Failed to fetch tasks');
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchTasksForWeek(currentWeek);
    }, [currentWeek, fetchTasksForWeek]);

    const onDragEnd = useCallback((result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceCol = [...(tasks[source.droppableId] || [])];
        const destCol = [...(tasks[destination.droppableId] || [])];

        const [movedTask] = sourceCol.splice(source.index, 1);

        const sourceDayIndex = daysOfWeek.indexOf(source.droppableId);
        const destDayIndex = daysOfWeek.indexOf(destination.droppableId);
        const dueDateOffset = destDayIndex - sourceDayIndex;
        const dueDate = moment(movedTask.due_date).add(dueDateOffset, 'days');

        movedTask.due_date = dueDate.toISOString(); // Обновляем due_date в самой задаче

        destCol.splice(destination.index, 0, movedTask);

        setTasks(prevTasks => ({
            ...prevTasks,
            [source.droppableId]: sourceCol,
            [destination.droppableId]: destCol,
        }));

        axios.patch(`${API_BASE_URL}/api/tasks/${movedTask.id}/`, movedTask, {
            headers: getAuthHeaders(),
        })
        .catch(error => {
            console.error(error);
            message.error('Failed to update task');
            // Возвращаем задачу в исходное состояние при ошибке
            setTasks(prevTasks => ({
                ...prevTasks,
                [source.droppableId]: [...prevTasks[source.droppableId], movedTask],
                [destination.droppableId]: prevTasks[destination.droppableId].filter(task => task.id !== movedTask.id),
            }));
        });

        console.log('Source Day:', source.droppableId);
        console.log('Destination Day:', destination.droppableId);
        console.log('Due Date Offset:', dueDateOffset);
        console.log('Due Date:', dueDate.format('MM/DD'));
    }, [tasks]);

    const handleAddTask = useCallback((value, due) => {
        const today = moment().startOf('week').add(currentWeek, 'weeks');
        const dueDate = today.clone().locale('ru').add(daysOfWeek.indexOf(due), 'days').endOf('day').toDate(); 
    
        const newTask = {
            name: value,
            column: null,
            description: '',
            due_date: dueDate.toISOString(),
        };
    
        axios.post(`${API_BASE_URL}/api/tasks/`, newTask, {
            headers: getAuthHeaders(),
        })
        .then(response => {
            const task = response.data;
            const day = moment(task.due_date).locale('ru').format('dddd');
            console.log('New task:', task);
            setTasks(prevTasks => {
                const updatedTasks = { ...prevTasks };
                if (!updatedTasks[day]) updatedTasks[day] = [];
                updatedTasks[day].push(task);
                console.log('Updated tasks:', updatedTasks);
                return updatedTasks;
            });
        })
        .catch(error => {
            console.error('There was an error creating the task:', error.response.data);
            message.error('Failed to add task');
        });
    }, [currentWeek]);

    const handleDeleteTask = useCallback((taskId) => {
        axios.delete(`${API_BASE_URL}/api/tasks/${taskId}/`, {
            headers: getAuthHeaders(),
        })
        .then(() => {
            setTasks(prevTasks => {
                const updatedTasks = { ...prevTasks };
                for (const day in updatedTasks) {
                    updatedTasks[day] = updatedTasks[day].filter(task => task.id !== taskId);
                }
                return updatedTasks;
            });
            message.success('Task deleted');
        })
        .catch(error => {
            console.error('Failed to delete task:', error);
            message.error('Failed to delete task');
        });
    }, []);

    const handleUpdateTask = useCallback((taskId, updatedTask) => {
        axios.patch(`${API_BASE_URL}/api/tasks/${taskId}/`, updatedTask, {
            headers: getAuthHeaders(),
        })
        .then(response => {
            const updatedTask = response.data;
            const day = moment(updatedTask.due_date).locale('ru').format('dddd');
            setTasks(prevTasks => {
                const updatedTasks = { ...prevTasks };
                for (const day in updatedTasks) {
                    updatedTasks[day] = updatedTasks[day].map(task => task.id === taskId ? updatedTask : task);
                }
                return updatedTasks;
            });
            message.success('Task updated');
        })
        .catch(error => {
            console.error('Failed to update task:', error);
            message.error('Failed to update task');
        });
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2 style={{ marginLeft: 50 }}>Персональные задачи</h2>
            <div style={{ marginBottom: '20px', marginRight: 50, marginLeft: 50, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setCurrentWeek(currentWeek - 1)}><DoubleLeftOutlined /></Button>
                <Button onClick={() => setCurrentWeek(currentWeek + 1)}> <DoubleRightOutlined /></Button>
            </div>
            <List style={{ padding: '0 50px' }}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Row gutter={16}>
                        {daysOfWeek.map(day => {
                            const startOfWeek = moment().startOf('week').add(currentWeek, 'weeks');
                            const dueDate = startOfWeek.clone().add(daysOfWeek.indexOf(day), 'days').endOf('day'); // Ensure end of day to prevent timezone issues
                            return (
                                <Col span={3} key={day}>
                                    <Droppable droppableId={day}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                                <Card title={`${day} - ${dueDate.format('MM/DD')}`} bordered={false} style={{ minHeight: '400px' }}>
                                                    {tasks[day] && tasks[day].map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <TaskItem 
                                                                        task={task} 
                                                                        onDelete={handleDeleteTask}
                                                                        onUpdate={handleUpdateTask} 
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                    <Input
                                                        placeholder="Добавить задачу"
                                                        size="small"
                                                        onBlur={(e) => handleAddTask(e.target.value, day)}
                                                    />
                                                </Card>
                                            </div>
                                        )}
                                    </Droppable>
                                </Col>
                            );
                        })}
                    </Row>
                </DragDropContext>
            </List>
        </div>
    );
};

export default TaskBoard;
