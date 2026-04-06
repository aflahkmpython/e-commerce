import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchLowStock = createAsyncThunk(
    'inventory/fetchLowStock',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/admin/inventory/low-stock/');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const updateStock = createAsyncThunk(
    'inventory/updateStock',
    async ({ id, stock }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/products/${id}/stock/`, { stock });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const bulkUpdateStock = createAsyncThunk(
    'inventory/bulkUpdateStock',
    async (updates, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch('/admin/inventory/bulk-stock/', { updates });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const fetchStockHistory = createAsyncThunk(
    'inventory/fetchStockHistory',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/admin/products/${id}/stock-history/`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const initialState = {
    lowStockItems: [],
    history: [],
    loading: false,
    historyLoading: false,
    updateLoading: false,
    error: null
};

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {
        optimisticUpdateStock: (state, action) => {
            const { id, stock } = action.payload;
            const index = state.lowStockItems.findIndex(i => i.id === id);
            if (index !== -1) {
                state.lowStockItems[index].stock = stock;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLowStock.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLowStock.fulfilled, (state, action) => {
                state.loading = false;
                state.lowStockItems = action.payload.results || action.payload; // Support both paginated and list
            })
            .addCase(fetchLowStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchStockHistory.pending, (state) => {
                state.historyLoading = true;
            })
            .addCase(fetchStockHistory.fulfilled, (state, action) => {
                state.historyLoading = false;
                state.history = action.payload.results || action.payload;
            })
            .addCase(updateStock.pending, (state) => {
                state.updateLoading = true;
            })
            .addCase(updateStock.fulfilled, (state) => {
                state.updateLoading = false;
            });
    }
});

export const { optimisticUpdateStock } = inventorySlice.actions;
export default inventorySlice.reducer;
