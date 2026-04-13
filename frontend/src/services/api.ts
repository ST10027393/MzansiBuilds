import axios from 'axios';
import { auth } from './firebase'; // 

const api = axios.create({
    baseURL: 'http://localhost:5152/api', // C# backend URL
});

api.interceptors.request.use(async (config) => {
    const user = auth.currentUser; // initialized instance
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;