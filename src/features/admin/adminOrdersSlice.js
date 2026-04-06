import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchAdminOrders = createAsyncThunk(
    'adminOrders/fetchAdminOrders',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('admin/orders/', { params });
            return {
                results: response.data.results || response.data,
                count: response.data.count || (response.data.length || 0)
            };
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to fetch orders');
        }
    }
);

export const fetchAdminOrderDetail = createAsyncThunk(
    'adminOrders/fetchAdminOrderDetail',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`admin/orders/${id}/`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to fetch order detail');
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'adminOrders/updateOrderStatus',
    async ({ id, status, notes }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`admin/orders/${id}/status/`, { status, notes });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to update status');
        }
    }
);

export const exportOrdersCsv = createAsyncThunk(
    'adminOrders/exportOrdersCsv',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('admin/orders/export/', { 
                params,
                responseType: 'blob' 
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'orders_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            return true;
        } catch (err) {
            return rejectWithValue('Failed to export CSV');
        }
    }
);

const initialState = {
    orders: [],
    totalCount: 0,
    currentOrder: null,
    loading: false,
    detailLoading: false,
    updateLoading: false,
    error: null,
    filters: {
        page: 1,
        status: '',
        payment_status: '',
        search: '',
        created_at_after: '',
        created_at_before: '',
    }
};

const adminOrdersSlice = createSlice({
    name: 'adminOrders',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        // Optimistic Update
        optimisticUpdateStatus: (state, action) => {
            const { id, status } = action.payload;
            if (state.currentOrder && state.currentOrder.id === id) {
                state.currentOrder.status = status;
            }
            const order = state.orders.find(o => o.id === id);
            if (order) {
                order.status = status;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch List
            .addCase(fetchAdminOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.results;
                state.totalCount = action.payload.count;
            })
            .addCase(fetchAdminOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Detail
            .addCase(fetchAdminOrderDetail.pending, (state) => {
                state.detailLoading = true;
                state.currentOrder = null;
            })
            .addCase(fetchAdminOrderDetail.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchAdminOrderDetail.rejected, (state) => {
                state.detailLoading = false;
            })
            // Update Status
            .addCase(updateOrderStatus.pending, (state) => {
                state.updateLoading = true;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.currentOrder = action.payload;
                const index = state.orders.findIndex(o => o.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            });
    }
});

export const { setFilters, resetFilters, optimisticUpdateStatus } = adminOrdersSlice.actions;
export default adminOrdersSlice.reducer;
