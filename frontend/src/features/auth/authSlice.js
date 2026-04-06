import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance, { setAuthToken } from '../../api/axiosInstance';

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('accounts/register/', userData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('accounts/login/', credentials);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    role: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.role = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setAuthToken(null);
        },
        updateTokens: (state, action) => {
            state.accessToken = action.payload.access;
            localStorage.setItem('accessToken', action.payload.access);
            setAuthToken(action.payload.access);
            if (action.payload.refresh) {
                state.refreshToken = action.payload.refresh;
                localStorage.setItem('refreshToken', action.payload.refresh);
            }
        },
        initializeAuth: (state) => {
            const access = localStorage.getItem('accessToken');
            const refresh = localStorage.getItem('refreshToken');
            let user = null;
            try {
                const userRaw = localStorage.getItem('user');
                if (userRaw && userRaw !== 'undefined') {
                    user = JSON.parse(userRaw);
                }
            } catch (error) {
                console.error("Failed to parse user from local storage", error);
            }
            
            if (access) {
                state.accessToken = access;
                state.refreshToken = refresh;
                state.user = user;
                state.isAuthenticated = true;
                state.role = user?.role;
                setAuthToken(access);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.accessToken = action.payload.access;
                state.refreshToken = action.payload.refresh;
                state.role = action.payload.role;

                localStorage.setItem('accessToken', action.payload.access);
                localStorage.setItem('refreshToken', action.payload.refresh);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
                setAuthToken(action.payload.access);
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { logout, updateTokens, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
