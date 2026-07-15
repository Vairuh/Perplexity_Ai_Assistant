import {initializeSocketConnection} from '../service/chat.socket';
import { sendMessage, getChats, getMessages, deleteChat } from '../service/chat.api';
import { setChats, setChatMessages, setCurrentChat, removeChat, setError, setLoading, addNewMessage, createNewChat, addMessage } from '../chat.slice';
import { useDispatch, useSelector } from 'react-redux';

export const useChat = () => {

    const dispatch = useDispatch();
    const currentChat = useSelector((state) => state.chat.currentChat);

    async function handleSendMessage({ chatId, message }) {
        dispatch(setLoading(true));
        const data = await sendMessage({ chatId, message });
        const{ ai, chat} = data;
        dispatch(createNewChat({
            chatId: chat._id,
            title: chat.title,
        }));
        dispatch(addNewMessage({
            chatId: chat._id,
            content: message,
            role: "user",
        }));
        dispatch(addNewMessage({
            chatId: chat._id,
            content: ai,
            role: "assistant",
        }));
        dispatch(setCurrentChat(chat._id));
        dispatch(setLoading(false));
    }

    async function handleGetChats() {
        dispatch(setLoading(true));
        try {
            const data = await getChats();
            const { chats } = data;
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[chat._id] = { title: chat.title, messages: [], id: chat._id, lastUpdated: Date.now() };
                return acc;
            }, {})));
        } catch (error) {
            dispatch(setError(error.message || 'Failed to load chats'));
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