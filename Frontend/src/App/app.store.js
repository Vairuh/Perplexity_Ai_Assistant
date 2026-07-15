import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/auth/pages/auth.slice';
import chatReducer from '../features/chat/pages/chat.slice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer, 
    },
});