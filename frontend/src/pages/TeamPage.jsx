// TeamPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Avatar, Row, Col, Typography, Button, Modal, Form, Input, message } from 'antd';
import axios from '../components/axiosInterceptor';
import Cookies from 'js-cookie';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import './styles.css'; // Импортируем стили из файла styles.css

const { Title } = Typography;

const getAuthHeaders = () => {
    const accessToken = Cookies.get('jwt_token');
    const refreshToken = Cookies.get('refresh_token');
    return {
        Authorization: `Bearer ${accessToken}`,
        'X-Refresh-Token': refreshToken,
    };
};

const TeamPage = () => {
    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const { teamId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/teams/${teamId}/`, {
                    headers: getAuthHeaders(),
                });
                setTeam(response.data.team);
                setMembers(response.data.members);
            } catch (error) {
                console.error('Ошибка при получении данных команды:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [teamId]);

    const handleInvite = async (values) => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/user-invitations/`, {
                email: values.email,
                team: teamId,
            }, {
                headers: getAuthHeaders(),
            });
            message.success('Приглашение отправлено!');
            setIsModalVisible(false);
        } catch (error) {
            console.error('Ошибка при отправке приглашения:', error);
            message.error('Не удалось отправить приглашение');
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/teams/${teamId}/members/${memberId}/`, {
                headers: getAuthHeaders(),
            });
            setMembers(members.filter(member => member.id !== memberId));
            message.success('Участник удален');
        } catch (error) {
            console.error('Ошибка при удалении участника:', error);
            message.error('Не удалось удалить участника');
        }
    };

    const handleDeleteTeam = async () => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/teams/${teamId}/`, {
                headers: getAuthHeaders(),
            });
            message.success('Команда удалена');
            navigate('/dashboard'); 
        } catch (error) {
            console.error('Ошибка при удалении команды:', error);
            message.error('Не удалось удалить команду');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="team-page-container" style={{marginTop: 15}}>
            <Title level={2} className="team-title">{team.name}</Title>
            <div className="team-actions">
                <Button
                    type="danger"
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteTeam}
                >
                    Удалить команду
                </Button>
                <Button
                    type="default"
                    onClick={() => setIsModalVisible(true)}
                    icon={<PlusOutlined />}
                    className="invite-button"
                >
                    Пригласить участника
                </Button>
            </div>
            <div className="team-members-container">
                <Row gutter={[16, 16]}>
                    {members.map(member => (
                        <Col span={8} key={member.id}>
                            <Card
                                hoverable
                                className="team-member-card"
                                actions={[
                                    <DeleteOutlined key="delete" onClick={() => handleRemoveMember(member.id)} />,
                                ]}
                            >
                                <Card.Meta
                                    avatar={<Avatar src={member.avatar} />}
                                    title={member.username}
                                    description={member.role}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <Modal
                title="Пригласить участника"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form onFinish={handleInvite}>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: 'Введите email' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Отправить приглашение
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeamPage;
