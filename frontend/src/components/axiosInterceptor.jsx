import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
  
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          try {
            // Отправляем запрос на сервер для обновления токена
            const response = await axios.post(`${API_BASE_URL}/token/refresh`, { refresh: refreshToken });
            // Обновляем access токен и сохраняем его в куки или localStorage
            const newAccessToken = response.data.access;
            Cookies.set('jwt_token', newAccessToken);
            // Повторно отправляем оригинальный запрос с новым access токеном
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Обработка ошибки при обновлении токена
            console.error('Ошибка при обновлении токена:', refreshError);

          }
        }
      }
      // Если ошибка не 401 или если произошла ошибка при обновлении токена, возвращаем её
      return Promise.reject(error);
    }
  );
  

export default axios;

