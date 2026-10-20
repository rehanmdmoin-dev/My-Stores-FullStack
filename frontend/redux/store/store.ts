import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice";
import productReducer from "../slice/productSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
