import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { shopService } from "../../firebaseservices/shop/shop.service";
import { categoryService } from "../../firebaseservices/category/category.service";
import { clusterService } from "../../firebaseservices/cluster/cluster.service";

export interface DashboardStats {
  totalShops: number;
  pendingShops: number;
  totalCategories: number;
  totalClusters: number;
}

export interface DashboardState {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    totalShops: 0,
    pendingShops: 0,
    totalCategories: 0,
    totalClusters: 0,
  },
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async () => {
    const [approvedShops, pendingShops, categories, clusters] = await Promise.all([
      shopService.getApprovedShops(),
      shopService.getPendingShops(),
      categoryService.getCategories(),
      clusterService.getClusters(),
    ]);

    return {
      totalShops: approvedShops.length,
      pendingShops: pendingShops.length,
      totalCategories: categories.length,
      totalClusters: clusters.length,
    };
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch stats";
      });
  },
});

export default dashboardSlice.reducer;
