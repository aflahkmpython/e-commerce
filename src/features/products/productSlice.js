import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('products/', { params });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`products/${id}/`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const fetchCategories = createAsyncThunk(
    'products/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('categories/');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const fetchAdminProducts = createAsyncThunk(
    'products/fetchAdminProducts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('admin/products/', { params });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const createAdminProduct = createAsyncThunk(
    'products/createAdminProduct',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('admin/products/create/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const updateAdminProduct = createAsyncThunk(
    'products/updateAdminProduct',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`admin/products/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const deleteAdminProduct = createAsyncThunk(
    'products/deleteAdminProduct',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`admin/products/${id}/delete/`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const updateAdminProductStock = createAsyncThunk(
    'products/updateAdminProductStock',
    async ({ id, stock }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`admin/products/${id}/stock/`, { stock });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const initialState = {
    items: [],
    categories: [],
    currentProduct: null,
    totalCount: 0,
    currentPage: 1,
    loading: false,
    error: null,
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Public fetching
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.results;
                state.totalCount = action.payload.count;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch products';
                if (action.error?.message?.includes('401') || action.error?.message?.includes('403')) {
                    state.items = [];
                }
            })
            // Admin fetching
            .addCase(fetchAdminProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.results || action.payload; // Handle both paginated and non-paginated
                state.totalCount = action.payload.count || action.payload.length;
            })
            // Individual product
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.currentProduct = action.payload;
            })
            // Create
            .addCase(createAdminProduct.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            // Update
            .addCase(updateAdminProduct.fulfilled, (state, action) => {
                const index = state.items.findIndex(p => p.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
                if (state.currentProduct?.id === action.payload.id) state.currentProduct = action.payload;
            })
            // Stock Update
            .addCase(updateAdminProductStock.fulfilled, (state, action) => {
                const index = state.items.findIndex(p => p.id === action.payload.id);
                // The status response for stock is slightly different, but assuming it returns the product or id/stock
                // Let's assume the view returns the updated product or at least the fields
                if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...action.payload };
                }
            })
            // Delete (Soft Delete)
            .addCase(deleteAdminProduct.fulfilled, (state, action) => {
                const index = state.items.findIndex(p => p.id === action.payload);
                if (index !== -1) {
                    state.items[index].is_active = false;
                }
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            });
    }
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
