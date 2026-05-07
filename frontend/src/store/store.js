import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../features/productSlice';
import reviewReducer from '../features/reviewSlice';
import analyticsReducer from '../features/analyticsSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    reviews: reviewReducer,
    analytics: analyticsReducer,
  },
});