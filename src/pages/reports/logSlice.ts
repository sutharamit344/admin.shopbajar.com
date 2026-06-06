import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logService, type ActivityLog } from "../../firebaseservices/log/log.service";

export interface LogState {
  logs: ActivityLog[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LogState = {
  logs: [],
  isLoading: false,
  error: null,
};

export const fetchLogs = createAsyncThunk("logs/fetchAll", async () => {
  return await logService.getGlobalLogs();
});

const logSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch logs";
      });
  },
});

export default logSlice.reducer;
