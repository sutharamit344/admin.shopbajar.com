import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { featureService, type Feature } from "../../firebaseservices/feature/feature.service";
import toast from "react-hot-toast";

export interface FeatureState {
  features: Feature[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FeatureState = {
  features: [],
  isLoading: false,
  error: null,
};

export const fetchAllFeatures = createAsyncThunk("features/fetchAll", async () => {
  return await featureService.getFeatures();
});

export const addFeatureAction = createAsyncThunk(
  "features/add",
  async (featureData: Omit<Feature, "id" | "createdAt" | "updatedAt">, { dispatch }) => {
    const result = await featureService.addFeature(featureData);
    if (result.success) {
      toast.success("Feature added successfully");
      dispatch(fetchAllFeatures());
    } else {
      toast.error("Failed to add feature");
      throw new Error(result.error);
    }
  }
);

export const updateFeatureAction = createAsyncThunk(
  "features/update",
  async ({ id, featureData }: { id: string; featureData: Partial<Feature> }, { dispatch }) => {
    const result = await featureService.updateFeature(id, featureData);
    if (result.success) {
      toast.success("Feature updated successfully");
      dispatch(fetchAllFeatures());
    } else {
      toast.error("Failed to update feature");
      throw new Error(result.error);
    }
  }
);

export const deleteFeatureAction = createAsyncThunk(
  "features/delete",
  async (id: string, { dispatch }) => {
    const result = await featureService.deleteFeature(id);
    if (result.success) {
      toast.success("Feature deleted successfully");
      dispatch(fetchAllFeatures());
    } else {
      toast.error("Failed to delete feature");
      throw new Error(result.error);
    }
  }
);

export const seedFeaturesAction = createAsyncThunk(
  "features/seed",
  async (_, { dispatch }) => {
    const result = await featureService.seedDefaultFeatures();
    if (result.success) {
      toast.success(result.message);
      dispatch(fetchAllFeatures());
    } else {
      toast.error("Failed to seed features");
      throw new Error(result.error);
    }
  }
);

const featureSlice = createSlice({
  name: "features",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFeatures.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFeatures.fulfilled, (state, action) => {
        state.isLoading = false;
        state.features = action.payload;
      })
      .addCase(fetchAllFeatures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch features";
      });
  },
});

export default featureSlice.reducer;
