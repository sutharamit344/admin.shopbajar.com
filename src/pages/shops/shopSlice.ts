import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  shopService,
  type Shop,
} from "../../firebaseservices/shop/shop.service";
import toast from "react-hot-toast";

export interface ShopState {
  shops: Shop[];
  pendingShops: Shop[];
  isLoading: boolean;
  error: string | null;
  // Incremental state
  lastVisibleDoc: any | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  totalCount: number;
}

const initialState: ShopState = {
  shops: [],
  pendingShops: [],
  isLoading: false,
  error: null,
  lastVisibleDoc: null,
  hasMore: false,
  isLoadingMore: false,
  totalCount: 0,
};

export const fetchAllShops = createAsyncThunk("shops/fetchAll", async () => {
  const [approved, pending] = await Promise.all([
    shopService.getApprovedShops(),
    shopService.getPendingShops(),
  ]);
  return { approved, pending };
});

export const fetchInitialShopsIncremental = createAsyncThunk(
  "shops/fetchInitialIncremental",
  async (pageSize: number | void = 25) => {
    const limitSize = pageSize || 25;
    const [approvedResult, pending] = await Promise.all([
      shopService.getApprovedShopsIncremental(limitSize),
      shopService.getPendingShops(),
    ]);
    return {
      approved: approvedResult.shops,
      lastVisibleDoc: approvedResult.lastVisibleDoc,
      hasMore: approvedResult.hasMore,
      totalCount: approvedResult.totalCount,
      pending,
    };
  },
);

export const fetchMoreShopsIncremental = createAsyncThunk(
  "shops/fetchMoreIncremental",
  async (pageSize: number | void = 25, { getState }) => {
    const limitSize = pageSize || 25;
    const state = (getState() as any).shops as ShopState;
    if (!state.hasMore || !state.lastVisibleDoc) {
      return null;
    }
    const result = await shopService.getApprovedShopsIncremental(
      limitSize,
      state.lastVisibleDoc,
    );
    return {
      approved: result.shops,
      lastVisibleDoc: result.lastVisibleDoc,
      hasMore: result.hasMore,
      totalCount: result.totalCount,
    };
  },
  {
    condition: (_, { getState }) => {
      const state = (getState() as any).shops as ShopState;
      if (!state.hasMore || state.isLoadingMore || !state.lastVisibleDoc) {
        return false;
      }
    },
  },
);

export const approveShopAction = createAsyncThunk(
  "shops/approve",
  async (id: string, { dispatch }) => {
    const result = await shopService.approveShop(id);
    if (result.success) {
      toast.success("Shop approved successfully");
      dispatch(fetchAllShops());
      dispatch(fetchInitialShopsIncremental());
    } else {
      toast.error("Failed to approve shop");
      throw new Error(result.error);
    }
  },
);

export const rejectShopAction = createAsyncThunk(
  "shops/reject",
  async ({ id, reason }: { id: string; reason: string }, { dispatch }) => {
    const result = await shopService.rejectShop(id, reason);
    if (result.success) {
      toast.success("Shop rejected");
      dispatch(fetchAllShops());
      dispatch(fetchInitialShopsIncremental());
    } else {
      toast.error("Failed to reject shop");
      throw new Error(result.error);
    }
  },
);

export const deleteShopAction = createAsyncThunk(
  "shops/delete",
  async (id: string, { dispatch }) => {
    const result = await shopService.deleteShop(id);
    if (result.success) {
      toast.success("Shop deleted successfully");
      dispatch(fetchAllShops());
      dispatch(fetchInitialShopsIncremental());
      return id;
    } else {
      toast.error("Failed to delete shop");
      throw new Error(result.error);
    }
  },
);

export const createShopAction = createAsyncThunk(
  "shops/create",
  async (data: Omit<Shop, "id">, { dispatch }) => {
    const result = await shopService.createShop(data);
    if (result.success) {
      toast.success("Shop created successfully");
      dispatch(fetchAllShops());
      dispatch(fetchInitialShopsIncremental());
      return result.id;
    } else {
      toast.error("Failed to create shop");
      throw new Error(result.error);
    }
  },
);

export const fetchShopByIdAction = createAsyncThunk(
  "shops/fetchById",
  async (id: string) => {
    const shop = await shopService.getShopById(id);
    if (!shop) throw new Error("Shop not found");
    return shop;
  },
);

export const updateShopAction = createAsyncThunk(
  "shops/update",
  async ({ id, data }: { id: string; data: Partial<Shop> }, { dispatch }) => {
    const result = await shopService.updateShop(id, data);
    if (result.success) {
      toast.success("Shop updated successfully");
      dispatch(fetchAllShops());
      dispatch(fetchInitialShopsIncremental());
      return { id, data };
    } else {
      toast.error("Failed to update shop");
      throw new Error(result.error);
    }
  },
);

export const bulkApproveShopsAction = createAsyncThunk(
  "shops/bulkApprove",
  async (ids: string[], { dispatch }) => {
    const result = await shopService.bulkApproveShops(ids);
    if (result.success) {
      toast.success(`Successfully approved ${ids.length} shops`);
      dispatch(fetchAllShops());
      dispatch(fetchInitialShopsIncremental());
      return ids;
    } else {
      toast.error("Failed to bulk approve shops");
      throw new Error(result.error);
    }
  },
);

const shopSlice = createSlice({
  name: "shops",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAllShops
      .addCase(fetchAllShops.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllShops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shops = action.payload.approved;
        state.pendingShops = action.payload.pending;
      })
      .addCase(fetchAllShops.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch shops";
      })
      // fetchInitialShopsIncremental
      .addCase(fetchInitialShopsIncremental.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInitialShopsIncremental.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shops = action.payload.approved;
        state.pendingShops = action.payload.pending;
        state.lastVisibleDoc = action.payload.lastVisibleDoc;
        state.hasMore = action.payload.hasMore;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchInitialShopsIncremental.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || "Failed to fetch shops incrementally";
      })
      // fetchMoreShopsIncremental
      .addCase(fetchMoreShopsIncremental.pending, (state) => {
        state.isLoadingMore = true;
      })
      .addCase(fetchMoreShopsIncremental.fulfilled, (state, action) => {
        state.isLoadingMore = false;
        if (action.payload) {
          state.shops = [...state.shops, ...action.payload.approved];
          state.lastVisibleDoc = action.payload.lastVisibleDoc;
          state.hasMore = action.payload.hasMore;
          state.totalCount = action.payload.totalCount;
        }
      })
      .addCase(fetchMoreShopsIncremental.rejected, (state, action) => {
        state.isLoadingMore = false;
        state.error = action.error.message || "Failed to fetch more shops";
      });
  },
});

export default shopSlice.reducer;
