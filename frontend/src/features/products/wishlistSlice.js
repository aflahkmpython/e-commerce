import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('products/wishlist/');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const toggleWishlist = createAsyncThunk(
    'wishlist/toggleWishlist',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`products/wishlist/toggle/${productId}/`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const initialState = {
    wishlist: null,
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = action.payload[0]; // DRF returns a list for the ViewSet
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                // We'll refetch or optimistic update. 
                // For now, let's just let the component handle the message.
            });
    }
});

export default wishlistSlice.reducer;
