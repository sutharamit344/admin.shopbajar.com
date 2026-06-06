import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clusterService, type Cluster } from "../../firebaseservices/cluster/cluster.service";
import toast from "react-hot-toast";

export interface ClusterState {
  clusters: Cluster[];
  pendingClusters: Cluster[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ClusterState = {
  clusters: [],
  pendingClusters: [],
  isLoading: false,
  error: null,
};

export const fetchAllClusters = createAsyncThunk("clusters/fetchAll", async () => {
  const [approved, pending] = await Promise.all([
    clusterService.getClusters(),
    clusterService.getPendingClusters(),
  ]);
  return { approved, pending };
});

export const addClusterAction = createAsyncThunk(
  "clusters/add",
  async (data: Partial<Cluster>, { dispatch }) => {
    const result = await clusterService.addCluster(data);
    if (result.success) {
      toast.success("Cluster added");
      dispatch(fetchAllClusters());
    } else {
      toast.error("Failed to add cluster");
      throw new Error(result.error);
    }
  }
);

export const approveClusterAction = createAsyncThunk(
  "clusters/approve",
  async (id: string, { dispatch }) => {
    const result = await clusterService.approveCluster(id);
    if (result.success) {
      toast.success("Cluster approved");
      dispatch(fetchAllClusters());
    } else {
      toast.error("Failed to approve");
      throw new Error(result.error);
    }
  }
);

export const rejectClusterAction = createAsyncThunk(
  "clusters/reject",
  async (id: string, { dispatch }) => {
    if (!confirm("Are you sure you want to remove this cluster?")) return;
    const result = await clusterService.rejectCluster(id);
    if (result.success) {
      toast.success("Cluster removed");
      dispatch(fetchAllClusters());
    } else {
      toast.error("Failed to remove");
      throw new Error(result.error);
    }
  }
);

export const updateClusterAction = createAsyncThunk(
  "clusters/update",
  async ({ id, ...data }: { id: string } & Partial<Cluster>, { dispatch }) => {
    const result = await clusterService.updateCluster(id, data);
    if (result.success) {
      toast.success("Cluster updated");
      dispatch(fetchAllClusters());
    } else {
      toast.error("Failed to update cluster");
      throw new Error(result.error);
    }
  }
);

const clusterSlice = createSlice({
  name: "clusters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllClusters.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllClusters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clusters = action.payload.approved;
        state.pendingClusters = action.payload.pending;
      })
      .addCase(fetchAllClusters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch clusters";
      });
  },
});

export default clusterSlice.reducer;
