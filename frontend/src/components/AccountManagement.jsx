import React, { useEffect, useState } from 'react';
import { Form, Input, Modal, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from '../components/axiosInterceptor';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
    const accessToken = Cookies.get('jwt_token');
    const refreshToken = Cookies.get('refresh_token');
    return {
        Authorization: `Bearer ${accessToken}`,
        'X-Refresh-Token': refreshToken,
    };
};

const AccountManagement = ({ isEditing, setIsEditing, isDeleting, setIsDeleting, username, setUsername, email, setEmail }) => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.userId) {
            setUserId(userData.userId);
        } else {
            message.error('User ID not found');
            navigate('/login');
        }
    }, [navigate]);

    const handleEdit = async (values) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/api/users/${userId}/`, values, {
                headers: getAuthHeaders(),
            });
            setUsername(response.data.username);
            setEmail(response.data.email);
            localStorage.setItem('user', JSON.stringify(response.data));
            message.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            message.error('Failed to update profile');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/api/users/${userId}/`, {
                headers: getAuthHeaders(),
            });
            message.success('Account deleted successfully');
            Cookies.remove('jwt_token');
            navigate('/login');
        } catch (error) {
            console.error('Failed to delete account:', error);
            message.error('Failed to delete account');
        }
    };

    return (
        <>
            <Modal
                title="Редактировать профиль"
                open={isEditing}
                onCancel={() => setIsEditing(false)}
                footer={null}
            >
                <Form
                    initialValues={{ username, email }}
                    onFinish={handleEdit}
                >
                    <Form.Item
                        name="username"
                        label="Логин"
                        rules={[{ required: true, message: 'Пожалуйста, введите Ваш логин' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: 'Пожалуйста, введите свой адрес электронной почты' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Сохранить</Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Подтвердить удаление аккаунта"
                open={isDeleting}
                onOk={handleDeleteAccount}
                onCancel={() => setIsDeleting(false)}
                okText="Удалить"
                okType="danger"
                cancelText="Отмена"
            >
                <p>Вы уверены, что хотите удалить свою учетную запись? Это действие не может быть отменено.</p>
            </Modal>
        </>
    );
};

export default AccountManagement;
