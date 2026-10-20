"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { Cookies } from "react-cookie";
import { endPoints } from "@/api/endpoints/endPoints";
import AxiosInstance from "@/api/axios/axios";

const cookies = new Cookies();

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthState {
  loading: boolean;
  user: AuthUser | null;
  isAuthenticated: boolean;
  error: string | null;
  pendingEmail: string | null; // email awaiting OTP verification
}

const initialState: AuthState = {
  loading: false,
  user: null,
  isAuthenticated: false,
  error: null,
  pendingEmail: null,
};

const extractError = (err: unknown, fallback: string): string => {
  if (typeof err === "object" && err !== null) {
    const maybeResponse = err as { response?: { data?: { message?: unknown } } };
    const message = maybeResponse.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;

    const maybeMessage = err as { message?: unknown };
    if (typeof maybeMessage.message === "string" && maybeMessage.message.trim()) {
      return maybeMessage.message;
    }
  }

  return fallback;
};

/* Register */
export const authRegister = createAsyncThunk(
  "auth/register",
  async (
    payload: {
      name: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await AxiosInstance.post(endPoints.auth.register, payload);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Registration failed"));
    }
  }
);

/* Verify OTP */
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (payload: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.post(endPoints.auth.verifyOtp, payload);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "OTP verification failed"));
    }
  }
);

/* Login */
export const authLogin = createAsyncThunk(
  "auth/login",
  async (
    payload: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await AxiosInstance.post(endPoints.auth.login, payload);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Invalid email or password"));
    }
  }
);

/* Fetch current profile (used to rehydrate session on refresh) */
export const fetchDashboard = createAsyncThunk(
  "auth/dashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.get(endPoints.auth.dashboard);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Session expired"));
    }
  }
);

/* Update profile */
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    payload: { name: string; email: string; phone: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await AxiosInstance.post(endPoints.auth.updateProfile, payload);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Could not update profile"));
    }
  }
);

/* Request password reset link (also reused for "Change Password" while logged in) */
export const requestPasswordReset = createAsyncThunk(
  "auth/resetPasswordLink",
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.post(
        endPoints.auth.resetPasswordLink,
        payload
      );
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Could not send reset link"));
    }
  }
);

export const authLogout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.post(endPoints.auth.logout, undefined, {
        withCredentials: true,
      });
      cookies.remove("token", { path: "/" });
      return res.data;
    } catch (err: unknown) {
      cookies.remove("token", { path: "/" });
      return rejectWithValue(extractError(err, "Logout failed"));
    }
  }
);

/* Reset password via emailed link */
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    payload: {
      id: string;
      token: string;
      password: string;
      confirm_password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { id, token, ...body } = payload;
      const res = await AxiosInstance.post(
        endPoints.auth.resetPassword(id, token),
        body
      );
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Could not reset password"));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      cookies.remove("token", { path: "/" });
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* Register */
      .addCase(authRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authRegister.fulfilled, (state, { payload, meta }) => {
        state.loading = false;
        state.pendingEmail = meta.arg.email;
        toast.success(payload.message || "Registered. Check your email for the OTP.");
      })
      .addCase(authRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(state.error || "Registration failed");
      })

      /* Verify OTP */
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.loading = false;
        toast.success(payload.message || "Email verified");
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(state.error || "Invalid OTP");
      })

      /* Login */
      .addCase(authLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authLogin.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.token) {
          cookies.set("token", payload.token, { path: "/", maxAge: 60 * 60 * 24 * 7 });
          state.user = payload.user;
          state.isAuthenticated = true;
          toast.success(payload.message || "Login successful");
        }
      })
      .addCase(authLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(state.error || "Login failed");
      })

      /* Dashboard (session rehydration) */
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchDashboard.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      /* Update profile */
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.data) {
          state.user = { ...state.user, ...payload.data } as AuthUser;
        }
        toast.success(payload.message || "Profile updated");
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        toast.error((action.payload as string) || "Could not update profile");
      })

      /* Reset password link */
      .addCase(requestPasswordReset.fulfilled, (state, { payload }) => {
        toast.success(payload.message || "Reset link sent");
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        toast.error((action.payload as string) || "Could not send reset link");
      })

      /* Reset password */
      .addCase(resetPassword.fulfilled, (state, { payload }) => {
        toast.success(payload.message || "Password reset successfully");
      })
      .addCase(resetPassword.rejected, (state, action) => {
        toast.error((action.payload as string) || "Could not reset password");
      })
      /* Logout */
      .addCase(authLogout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authLogout.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        cookies.remove("token", { path: "/" });
        toast.success(payload.message || "Logged out successfully");
      })
      .addCase(authLogout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
        cookies.remove("token", { path: "/" });
        toast.error(state.error || "Logout failed");
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
