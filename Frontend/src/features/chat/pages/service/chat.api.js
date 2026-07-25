import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    withCredentials: true,
});

export const sendMessage = async ({ chatId, message }) => {
    const response = await api.post('/api/chats/message', { chatId, message });
    return response.data;
};

export const getChats = async () => {
    const response = await api.get('/api/chats');
    return response.data;
};

export const getMessages = async (chatId) => {
    const response = await api.get(`/api/chats/${chatId}/messages`);
    return response.data;
};

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chats/delete/${chatId}`);
    return response.data;
};

