import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Typography, message } from 'antd';
import './styles.css';
import Cookies from 'js-cookie';

const { Title, Paragraph } = Typography;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/login/', {
        username,
        password,
      });
      const { tokens, userData } = response.data; 
      
      console.log(response.data); // Выводим данные пользователя в консоль
      // Устанавливаем JWT токен в cookie
      // Cookies.set('jwt_token', response.data.token);
       // Устанавливаем JWT токен в cookie с атрибутами SameSite и HttpOnly
      Cookies.set('jwt_token', tokens.access, { SameSite: 'Lax', HttpOnly: false });
      Cookies.set('refresh_token', tokens.refresh, { SameSite: 'Lax', HttpOnly: false });
      Cookies.set('checkToken', 'true');

      // Сохраняем данные о пользователе в localStorage или состояние приложения
      localStorage.setItem('user', JSON.stringify(userData));
      console.log(Cookies.getAll)
      message.success('Вы успешно вошли в систему!');
      // Перенаправляем пользователя на другую страницу
      navigate('/dashboard'); 
    } catch (error) {
      console.error('Login error:', error);
      message.error('Ошибка входа: ' + error.message);
    }
  };

  useEffect(() => {
    // Проверяем, есть ли у пользователя сохраненный JWT токен при загрузке компонента
    const jwtToken = Cookies.get('jwt_token');
    if (jwtToken) {
      // Перенаправляем пользователя на другую страницу, например, дашборд, если у него есть токен
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="container">
      <Form
        name="login"
        onFinish={handleLogin}
        layout="vertical"
        className="form-container"
      >
        <Title level={2} className="title">Вход</Title>
        <Paragraph type="secondary" className="paragraph">Введите ваши учетные данные для входа.</Paragraph>
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Введите имя пользователя!' }]}
        >
          <Input
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Введите пароль!' }]}
        >
          <Input.Password
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block style={{ backgroundColor: 'black' }}>
            Войти
          </Button>
        </Form.Item>
        <Form.Item>
          {/* <Button type="link" block style={{ color: 'black', fontWeight: 'bold' }}>
            <Link to="/registration">Нет аккаунта? Зарегистрируйтесь</Link>
          </Button> */}
          <p style={{ textAlign: 'right', marginBottom: '0px' }}>
            Нет аккаунта?{' '}
            <Link
              to="/registration"
              style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}
            >
              Зарегистрируйтесь
            </Link>
          </p>
        </Form.Item>
      </Form>

    </div>
  );
};

export default Login;