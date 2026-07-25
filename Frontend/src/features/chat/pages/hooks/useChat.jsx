import {initializeSocketConnection} from '../service/chat.socket';
import { sendMessage, getChats, getMessages, deleteChat } from '../service/chat.api';
import { setChats, setChatMessages, setCurrentChat, removeChat, setError, setLoading, addNewMessage, createNewChat, addMessage } from '../chat.slice';
import { useDispatch, useSelector } from 'react-redux';

export const useChat = () => {

    const dispatch = useDispatch();
    const currentChat = useSelector((state) => state.chat.currentChat);

    async function handleSendMessage({ chatId, message }) {
        dispatch(setLoading(true));
        try {
            const data = await sendMessage({ chatId, message });
            const { ai, chat } = data;
            dispatch(createNewChat({ chatId: chat._id, title: chat.title }));
            dispatch(addNewMessage({ chatId: chat._id, content: message, role: 'user' }));
            dispatch(addNewMessage({ chatId: chat._id, content: ai, role: 'assistant' }));
            dispatch(setCurrentChat(chat._id));
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || 'Failed to send message'));
            throw error; // re-throw so Dashboard can clear the sending state
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true));
        try {
            const data = await getChats();
            const { chats } = data;

            const chatsMap = chats.reduce((acc, chat) => {
                acc[chat._id] = { title: chat.title, messages: [], id: chat._id, lastUpdated: new Date(chat.updatedAt || chat.createdAt).getTime() || Date.now() };
                return acc;
            }, {});

            dispatch(setChats(chatsMap));

            // Return sorted list so Dashboard can auto-load the first chat's messages
            const sorted = chats.sort((a, b) =>
                new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
            );
            return sorted;
        } catch (error) {
            dispatch(setError(error.message || 'Failed to load chats'));
            return [];
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleOpenChat(chatId) {
        const data = await getMessages(chatId);
        const { messages } = data;

        const formattedMessages = messages.map(msg => ({
            content: msg.content,
            role: msg.role,
        }));
        dispatch(addMessage({
            chatId,
            messages: formattedMessages,
        }));
        dispatch(setCurrentChat(chatId));
    }

    function handleSetCurrentChat(chatId) {
        dispatch(setCurrentChat(chatId));
    }

    async function handleGetMessages(chatId) {
        dispatch(setLoading(true));
        try {
            const data = await getMessages(chatId);
            const { messages } = data;
            dispatch(setChatMessages({ chatId, messages }));
        } catch (error) {
            dispatch(setError(error.message || 'Failed to load messages'));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleDeleteChat(chatId) {
        dispatch(setLoading(true));
        try {
            await deleteChat(chatId);
            dispatch(removeChat(chatId));
            if (chatId === currentChat) {
                dispatch(setCurrentChat(null));
            }
            await handleGetChats();
        } catch (error) {
            dispatch(setError(error.message || 'Failed to delete chat'));
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleGetMessages,
        handleSetCurrentChat,
        handleOpenChat,
        handleDeleteChat,
    };
}