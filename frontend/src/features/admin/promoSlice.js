import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchPromoCodes = createAsyncThunk(
    'promos/fetchAll',
    async (expired = false, { rejectWithValue }) => {
        try {
            const url = expired ? '/admin/promos/?expired=true' : '/admin/promos/';
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const createPromoCode = createAsyncThunk(
    'promos/create',
    async (promoData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/promos/', promoData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const updatePromoCode = createAsyncThunk(
    'promos/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/promos/${id}/`, data);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const deletePromoCode = createAsyncThunk(
    'promos/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/admin/promos/${id}/`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const bulkDeactivatePromos = createAsyncThunk(
    'promos/bulkDeactivate',
    async (ids, { rejectWithValue }) => {
        try {
            await axiosInstance.post('/admin/promos/bulk-deactivate/', { ids });
            return ids;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const fetchPromoUsage = createAsyncThunk(
    'promos/fetchUsage',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/admin/promos/${id}/usage/`);
            return { id, usages: response.data.results || response.data };
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const promoSlice = createSlice({
    name: 'promos',
    initialState: {
        list: [],
        usages: {}, // maps promo id to array of usages
        loading: false,
        usageLoading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPromoCodes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPromoCodes.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.results || action.payload;
            })
            .addCase(createPromoCode.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })
            .addCase(updatePromoCode.fulfilled, (state, action) => {
                const index = state.list.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })
            .addCase(deletePromoCode.fulfilled, (state, action) => {
                state.list = state.list.filter(p => p.id !== action.payload);
            })
            .addCase(bulkDeactivatePromos.fulfilled, (state, action) => {
                action.payload.forEach(id => {
                    const index = state.list.findIndex(p => p.id === id);
                    if (index !== -1) {
                        state.list[index].is_active = false;
                    }
                });
            })
            .addCase(fetchPromoUsage.pending, (state) => {
                state.usageLoading = true;
            })
            .addCase(fetchPromoUsage.fulfilled, (state, action) => {
                state.usageLoading = false;
                state.usages[action.payload.id] = action.payload.usages;
            });
    }
});

export default promoSlice.reducer;
