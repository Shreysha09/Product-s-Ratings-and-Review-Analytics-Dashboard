import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAnalytics } from '../services/api';

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async () => {
    const response = await getAnalytics();
    return response.data;
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    productsPerCategory: [],
    topReviewedProducts: [],
    discountDistribution: [],
    categoryWiseRating: [],
    categories: [],
    productStats: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.productsPerCategory = action.payload.productsPerCategory || [];
        state.topReviewedProducts = action.payload.topReviewedProducts || [];
        state.discountDistribution = action.payload.discountDistribution || [];
        state.categoryWiseRating = action.payload.categoryWiseRating || [];
        state.categories = action.payload.categories || [];
        state.productStats = action.payload.productStats || {};
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default analyticsSlice.reducer;