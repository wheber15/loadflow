import axios from 'axios';

const api = axios.create({
  baseURL:
    'https://loadflow-backend-6idm.onrender.com',
});

export default api;