import {useDispatch} from 'react-redux';
import {login, register, getMe} from '../services/auth.api';
import {setUser,setLoading,setError} from '../auth.slice';

export function useAuth() {
    const dispatch = useDispatch();

    async function handleregister({email, username, password}) {
        try {
            dispatch(setError(null));
            dispatch(setLoading(true));
            const data = await register({email, username, password});
            dispatch(setUser(data.user));    
        }
        catch (error) {
            dispatch(setError(error.response?.data?.message || 'Registration failed'));
        }
        finally {
            dispatch(setLoading(false));
        }
    }

    async function handlelogin({email, password}) {
        try {
            dispatch(setError(null));
            dispatch(setLoading(true));
            const data = await login({email, password});
            dispatch(setUser(data.user));
        }
        catch (error) {
            dispatch(setError(error.response?.data?.message || 'Login failed'));
        }
        finally {
            dispatch(setLoading(false));
        }
    }

    async function handlegetMe() {
        try {
            dispatch(setError(null));
            dispatch(setLoading(true));
            const data = await getMe();
            dispatch(setUser(data.user));
        }
        catch (error) {
            // 401 just means no active session — not an error to display
            if (error.response?.status !== 401) {
                dispatch(setError(error.response?.data?.message || 'Failed to fetch user details'));
            }
        }
        finally {
            dispatch(setLoading(false));
        }
    }

    return { handleregister, handlelogin, handlegetMe };
}
