import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: 'http://172.20.10.2:5000/api',
});

export default api;