import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchSiteConfig = createAsyncThunk(
    'site/fetchConfig',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/site-config/admin/site-config/');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const updateSiteConfig = createAsyncThunk(
    'site/updateConfig',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch('/site-config/admin/site-config/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const fetchBanners = createAsyncThunk(
    'site/fetchBanners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/site-config/admin/banners/');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const reorderBannersAction = createAsyncThunk(
    'site/reorderBanners',
    async (bannerIds, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/site-config/admin/banners/reorder/', { banner_ids: bannerIds });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const createBanner = createAsyncThunk(
    'site/createBanner',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/site-config/admin/banners/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const updateBannerThunk = createAsyncThunk(
    'site/updateBanner',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/site-config/admin/banners/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const deleteBannerThunk = createAsyncThunk(
    'site/deleteBanner',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/site-config/admin/banners/${id}/`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const fetchFeatured = createAsyncThunk(
    'site/fetchFeatured',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/site-config/admin/featured-products/');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const addFeatured = createAsyncThunk(
    'site/addFeatured',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/site-config/admin/featured-products/', { product: productId });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const removeFeatured = createAsyncThunk(
    'site/removeFeatured',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/site-config/admin/featured-products/${id}/`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const initialState = {
    config: null,
    banners: [],
    featuredProducts: [],
    loading: false,
    updateLoading: false,
    error: null
};

const siteCustomizationSlice = createSlice({
    name: 'siteCustomization',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSiteConfig.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSiteConfig.fulfilled, (state, action) => {
                state.loading = false;
                state.config = action.payload;
            })
            .addCase(fetchBanners.fulfilled, (state, action) => {
                state.banners = action.payload.results || action.payload;
            })
            .addCase(fetchFeatured.fulfilled, (state, action) => {
                state.featuredProducts = action.payload.results || action.payload;
            })
            .addCase(updateSiteConfig.pending, (state) => {
                state.updateLoading = true;
            })
            .addCase(updateSiteConfig.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.config = action.payload;
            })
            .addCase(updateSiteConfig.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })
            .addCase(removeFeatured.fulfilled, (state, action) => {
                state.featuredProducts = state.featuredProducts.filter(p => p.id !== action.payload);
            });
    }
});

export default siteCustomizationSlice.reducer;
