"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { endPoints } from "@/api/endpoints/endPoints";
import AxiosInstance from "@/api/axios/axios";

export interface Product {
  _id: string;
  productName: string;
  productPrice: number;
  desc: string;
  image: string;
  imagePublicId: string;
  size: string[];
  color: string[];
  stock: number;
  brand: string;
  createdBy: string;
  isdeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  loading: boolean;
  products: Product[];
  search: string;
  error: string | null;
}

const initialState: ProductState = {
  loading: false,
  products: [],
  search: "",
  error: null,
};

const extractError = (err: any, fallback: string) =>
  err?.response?.data?.message || fallback;

/** Builds multipart/form-data since the backend accepts an optional image file via Multer */
const buildProductFormData = (data: {
  productName: string;
  productPrice: number | string;
  desc: string;
  brand: string;
  stock?: number | string;
  size?: string[];
  color?: string[];
  image?: File | null;
}) => {
  const formData = new FormData();
  formData.append("productName", data.productName);
  formData.append("productPrice", String(data.productPrice));
  formData.append("desc", data.desc);
  formData.append("brand", data.brand);
  if (data.stock !== undefined) formData.append("stock", String(data.stock));
  if (data.size?.length) formData.append("size", data.size.join(","));
  if (data.color?.length) formData.append("color", data.color.join(","));
  if (data.image) formData.append("image", data.image);
  return formData;
};

/* Create */
export const createProduct = createAsyncThunk(
  "product/create",
  async (payload: Parameters<typeof buildProductFormData>[0], { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.post(
        endPoints.product.create,
        buildProductFormData(payload)
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(extractError(err, "Could not create product"));
    }
  }
);

/* List */
export const fetchProducts = createAsyncThunk(
  "product/list",
  async (_, { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.get(endPoints.product.list);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(extractError(err, "Could not load products"));
    }
  }
);

/* Update */
export const updateProduct = createAsyncThunk(
  "product/update",
  async (
    { id, data }: { id: string; data: Parameters<typeof buildProductFormData>[0] },
    { rejectWithValue }
  ) => {
    try {
      const res = await AxiosInstance.put(
        endPoints.product.update(id),
        buildProductFormData(data)
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(extractError(err, "Could not update product"));
    }
  }
);

/* Delete */
export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await AxiosInstance.delete(endPoints.product.delete(id));
      return id;
    } catch (err: any) {
      return rejectWithValue(extractError(err, "Could not delete product"));
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /* List */
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload?.data || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* Create */
      .addCase(createProduct.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.products.unshift(action.payload.data);
        }
        toast.success(action.payload?.message || "Product created");
      })
      .addCase(createProduct.rejected, (state, action) => {
        toast.error((action.payload as string) || "Could not create product");
      })

      /* Update */
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (updated) {
          const index = state.products.findIndex((p) => p._id === updated._id);
          if (index !== -1) state.products[index] = updated;
        }
        toast.success(action.payload?.message || "Product updated");
      })
      .addCase(updateProduct.rejected, (state, action) => {
        toast.error((action.payload as string) || "Could not update product");
      })

      /* Delete */
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
        toast.success("Product deleted");
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        toast.error((action.payload as string) || "Could not delete product");
      });
  },
});

export const { setSearch } = productSlice.actions;
export default productSlice.reducer;
