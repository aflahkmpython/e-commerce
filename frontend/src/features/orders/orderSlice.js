import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/orders/orders/', orderData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/orders/orders/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        currentOrder: null,
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        resetOrderState: (state) => {
            state.success = false;
            state.error = null;
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentOrder = action.payload;
                state.orders = [action.payload, ...state.orders];
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
