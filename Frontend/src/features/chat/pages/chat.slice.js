import {createSlice} from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChat: null,
        isloading: false,
        error: null,
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload;
            if (!state.chats[chatId]) {
                state.chats[chatId] = { title, messages: [], lastUpdated: Date.now() };
            } else {
                state.chats[chatId].title = title || state.chats[chatId].title;
                state.chats[chatId].lastUpdated = Date.now();
            }
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload;
            state.chats[chatId].messages.push({ content, role });
        },
        addMessage: (state, action) => {
            const { chatId, messages } = action.payload;
            state.chats[chatId].messages = [...state.chats[chatId].messages, ...messages];
        },  
        setChats: (state, action) => {
            state.chats = action.payload;
        },
        setChatMessages: (state, action) => {
            const { chatId, messages } = action.payload;
            if (state.chats[chatId]) {
                // Map from MongoDB objects to simple {content, role}
                state.chats[chatId].messages = messages.map(m => ({
                    content: m.content,
                    role: m.role,
                }));
            }
        },
        setCurrentChat: (state, action) => {
            state.currentChat = action.payload;
        },
        removeChat: (state, action) => {
            const chatId = action.payload;
            delete state.chats[chatId];
            if (state.currentChat === chatId) {
                state.currentChat = null;
            }
        },
        setLoading: (state, action) => {
            state.isloading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const { setChats, setChatMessages, setCurrentChat, removeChat, setLoading, setError, createNewChat, addNewMessage, addMessage } = chatSlice.actions;
export default chatSlice.reducer;

