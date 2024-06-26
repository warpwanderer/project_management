import React, { useState, useEffect  } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Select } from 'antd';
import axios from 'axios';
import './styles.css';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const RegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/roles/');
                setRoles(response.data);
            } catch (error) {
                message.error('Ошибка загрузки ролей: ' + error.message);
            }
        };

        fetchRoles();
    }, []);


    const onFinish = async (values) => {
        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/register/', values);
            message.success('Пользователь успешно зарегистрирован!');
            //
            setLoading(false);
            // Перенаправляем пользователя на страницу входа после успешной регистрации
            navigate('/login');
        } catch (error) {
            message.error('Ошибка регистрации: ' + error.message);
        }
        setLoading(false);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className="container">
            <Form
                name="registration"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                layout="vertical"
                className="form-container"
                style={{width: 450} }
            >
                <Title level={2} className="title">Регистрация</Title>
                <Paragraph type="secondary" className="paragraph">Заполните форму для регистрации.</Paragraph>
                <Form.Item
                    label="Имя пользователя"
                    name="username"
                    rules={[{ required: true, message: 'Введите имя пользователя!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: false, type: 'email', message: 'Введите корректный email!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Пароль"
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль!' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    label="Роль"
                    name="role"
                    rules={[{ required: true, message: 'Выберите роль!' }]}
                >
                    <Select placeholder="Выберите роль" loading={roles.length === 0}>
                    {roles.map((role) => (
                        <Option key={role.id} value={role.id}>
                            {role.name}
                        </Option>
                    ))}
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block style={{ backgroundColor: 'black' }}>
                        Зарегистрироваться
                    </Button>
                </Form.Item>

                <Form.Item>
                    <p style={{ textAlign: 'right', marginBottom: '0px' }}>
                        Есть аккаунт?{' '}
                        <Link
                            to="/login"
                            style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}
                        >
                            Войдите
                        </Link>
                    </p>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RegistrationForm;