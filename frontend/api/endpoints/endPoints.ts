// Matches app/routes/api/authRoute.js and app/routes/api/productRoute.js exactly.
// Everything below is prefixed with /api by axios's baseURL.

export const endPoints = {
  auth: {
    register: "/register",
    verifyOtp: "/verify-otp",
    login: "/login",
    logout: "/logout",
    refreshToken: "/refresh-token",
    resetPasswordLink: "/reset-password-link",
    resetPassword: (id: string, token: string) =>
      `/reset-password/${id}/${token}`,
    dashboard: "/dashboard",
    updateProfile: "/update-profile",
  },
  product: {
    create: "/user/create/product",
    list: "/user/get/product",
    update: (id: string) => `/user/update/product/${id}`,
    delete: (id: string) => `/user/delete/product/${id}`,
  },
};
