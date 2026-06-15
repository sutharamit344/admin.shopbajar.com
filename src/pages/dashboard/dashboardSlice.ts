import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { shopService, type Shop } from "../../firebaseservices/shop/shop.service";
import { categoryService } from "../../firebaseservices/category/category.service";
import { clusterService } from "../../firebaseservices/cluster/cluster.service";
import { inquiryService, type Inquiry } from "../../firebaseservices/inquiry/inquiry.service";
import { logService, type ActivityLog } from "../../firebaseservices/log/log.service";
import { blogService } from "../../firebaseservices/blog/blog.service";

export interface DashboardStats {
  totalShops: number;
  pendingShops: number;
  totalCategories: number;
  totalClusters: number;
  totalInquiries: number;
  totalBlogs: number;
  recentLogs: ActivityLog[];
  recentShops: Shop[];
  recentInquiries: Inquiry[];
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
    totalInquiries: 0,
    totalBlogs: 0,
    recentLogs: [],
    recentShops: [],
    recentInquiries: [],
  },
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async () => {
    const [
      approvedShops,
      pendingShops,
      categories,
      clusters,
      blogs,
      inquiries,
      logs,
    ] = await Promise.all([
      shopService.getApprovedShops(),
      shopService.getPendingShops(),
      categoryService.getCategories(),
      clusterService.getClusters(),
      blogService.getBlogs(5),
      inquiryService.getInquiries(10),
      logService.getGlobalLogs(10),
    ]);

    const allShops = [...approvedShops, ...pendingShops];
    const recentShops = allShops
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);

    return {
      totalShops: approvedShops.length,
      pendingShops: pendingShops.length,
      totalCategories: categories.length,
      totalClusters: clusters.length,
      totalInquiries: inquiries.length,
      totalBlogs: blogs.length,
      recentLogs: logs.slice(0, 5),
      recentShops,
      recentInquiries: inquiries.slice(0, 5),
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
