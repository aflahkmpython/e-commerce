import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/dashboard/');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch stats');
    }
  }
);

export const fetchDailyRevenue = createAsyncThunk(
  'dashboard/fetchDailyRevenue',
  async (days, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/admin/dashboard/revenue/?days=${days}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch revenue');
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  'dashboard/fetchTopProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/dashboard/top-products/');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch top products');
    }
  }
);

export const fetchRecentOrders = createAsyncThunk(
  'dashboard/fetchRecentOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/dashboard/recent-orders/');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch recent orders');
    }
  }
);

const initialState = {
  stats: { data: null, loading: false, error: null },
  dailyRevenue: { data: [], loading: false, error: null },
  topProducts: { data: [], loading: false, error: null },
  recentOrders: { data: [], loading: false, error: null },
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload;
      })
      // Daily Revenue
      .addCase(fetchDailyRevenue.pending, (state) => {
        state.dailyRevenue.loading = true;
        state.dailyRevenue.error = null;
      })
      .addCase(fetchDailyRevenue.fulfilled, (state, action) => {
        state.dailyRevenue.loading = false;
        state.dailyRevenue.data = action.payload;
      })
      .addCase(fetchDailyRevenue.rejected, (state, action) => {
        state.dailyRevenue.loading = false;
        state.dailyRevenue.error = action.payload;
      })
      // Top Products
      .addCase(fetchTopProducts.pending, (state) => {
        state.topProducts.loading = true;
        state.topProducts.error = null;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.topProducts.loading = false;
        state.topProducts.data = action.payload;
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.topProducts.loading = false;
        state.topProducts.error = action.payload;
      })
      // Recent Orders
      .addCase(fetchRecentOrders.pending, (state) => {
        state.recentOrders.loading = true;
        state.recentOrders.error = null;
      })
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.recentOrders.loading = false;
        state.recentOrders.data = action.payload;
      })
      .addCase(fetchRecentOrders.rejected, (state, action) => {
        state.recentOrders.loading = false;
        state.recentOrders.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
