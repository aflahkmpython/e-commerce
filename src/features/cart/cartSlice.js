import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('orders/cart/');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ product_id, quantity }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('orders/cart/add_item/', { product_id, quantity });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (product_id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('orders/cart/remove_item/', { product_id });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const updateQuantity = createAsyncThunk(
    'cart/updateQuantity',
    async ({ product_id, quantity }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('orders/cart/update_quantity/', { product_id, quantity });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const applyPromoCode = createAsyncThunk(
    'cart/applyPromoCode',
    async (code, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('orders/cart/apply-promo/', { code });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const initialState = {
    items: [],
    totalPrice: 0,
    loading: false,
    error: null,
    promoCode: null,
    promoDiscount: 0,
    newTotal: 0,
    promoError: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCartLocal: (state) => {
            state.items = [];
            state.totalPrice = 0;
            state.promoCode = null;
            state.promoDiscount = 0;
            state.newTotal = 0;
            state.promoError = null;
        },
        clearPromo: (state) => {
            state.promoCode = null;
            state.promoDiscount = 0;
            state.newTotal = state.totalPrice;
            state.promoError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalPrice = action.payload.total_price;
                state.newTotal = action.payload.total_price - state.promoDiscount;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.totalPrice = action.payload.total_price;
                state.newTotal = action.payload.total_price - state.promoDiscount;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.totalPrice = action.payload.total_price;
                state.newTotal = action.payload.total_price - state.promoDiscount;
            })
            .addCase(updateQuantity.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.totalPrice = action.payload.total_price;
                state.newTotal = action.payload.total_price - state.promoDiscount;
            })
            .addCase(applyPromoCode.fulfilled, (state, action) => {
                state.promoCode = action.payload; // { promo_id, code, discount_amount, new_total }
                state.promoDiscount = action.payload.discount_amount;
                state.newTotal = action.payload.new_total;
                state.promoError = null;
            })
            .addCase(applyPromoCode.rejected, (state, action) => {
                state.promoError = action.payload?.error || 'Invalid promo code';
                state.promoCode = null;
                state.promoDiscount = 0;
                state.newTotal = state.totalPrice;
            });
    }
});

export const { clearCartLocal, clearPromo } = cartSlice.actions;
export default cartSlice.reducer;
