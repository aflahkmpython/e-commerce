import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchAdminUsers = createAsyncThunk(
    'adminUsers/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/admin/users/', { params });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const fetchAdminUserDetail = createAsyncThunk(
    'adminUsers/fetchDetail',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/admin/users/${id}/`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const updateUserRole = createAsyncThunk(
    'adminUsers/updateRole',
    async ({ id, role }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/users/${id}/role/`, { role });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const toggleUserActive = createAsyncThunk(
    'adminUsers/toggleActive',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/users/${id}/deactivate/`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const initialState = {
    users: [],
    count: 0,
    currentUser: null,
    loading: false,
    detailLoading: false,
    updateLoading: false,
    error: null,
    filters: {
        search: '',
        role: '',
        is_active: '',
        ordering: '-date_joined',
        page: 1
    }
};

const adminUsersSlice = createSlice({
    name: 'adminUsers',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        optimisticUpdateUser: (state, action) => {
            const { id, updates } = action.payload;
            const index = state.users.findIndex(u => u.id === id);
            if (index !== -1) {
                state.users[index] = { ...state.users[index], ...updates };
            }
            if (state.currentUser && state.currentUser.id === id) {
                state.currentUser = { ...state.currentUser, ...updates };
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAdminUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.results;
                state.count = action.payload.count;
            })
            .addCase(fetchAdminUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Detail
            .addCase(fetchAdminUserDetail.pending, (state) => {
                state.detailLoading = true;
            })
            .addCase(fetchAdminUserDetail.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.currentUser = action.payload;
            })
            .addCase(fetchAdminUserDetail.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = action.payload;
            })
            // Update Role
            .addCase(updateUserRole.pending, (state) => {
                state.updateLoading = true;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.currentUser = action.payload;
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            });
    }
});

export const { setFilters, resetFilters, optimisticUpdateUser } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
