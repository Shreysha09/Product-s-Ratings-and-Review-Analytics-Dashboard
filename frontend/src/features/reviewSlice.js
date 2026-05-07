import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getReviews } from '../services/api';

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (params) => {
    const response = await getReviews(params);
    return response.data;
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    items: [],
    currentPage: 1,
    total: 0,
    loading: false,
    error: null,
    filters: {
      search: '',
      rating: '',
    },
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        rating: '',
      };
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setCurrentPage, setFilters, resetFilters } = reviewSlice.actions;
export default reviewSlice.reducer;