import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/configuration';

const http = axios.create({ baseURL: API_BASE_URL, timeout: API_TIMEOUT });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
