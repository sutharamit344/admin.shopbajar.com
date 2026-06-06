import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { inquiryService, type Inquiry } from "../../firebaseservices/inquiry/inquiry.service";
import toast from "react-hot-toast";

export interface InquiryState {
  inquiries: Inquiry[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InquiryState = {
  inquiries: [],
  isLoading: false,
  error: null,
};

export const fetchInquiries = createAsyncThunk("inquiries/fetchAll", async () => {
  return await inquiryService.getInquiries();
});

export const toggleInquiryReadAction = createAsyncThunk(
  "inquiries/toggleRead",
  async ({ id, currentStatus }: { id: string; currentStatus: "new" | "read" }, { dispatch }) => {
    const newStatus = currentStatus === "read" ? "new" : "read";
    const result = await inquiryService.updateStatus(id, newStatus);
    if (result.success) {
      dispatch(fetchInquiries());
    } else {
      toast.error("Failed to update status");
      throw new Error(result.error);
    }
  }
);

export const deleteInquiryAction = createAsyncThunk(
  "inquiries/delete",
  async (id: string, { dispatch }) => {
    if (!confirm("Delete this inquiry?")) return;
    const result = await inquiryService.deleteInquiry(id);
    if (result.success) {
      toast.success("Inquiry deleted");
      dispatch(fetchInquiries());
    } else {
      toast.error("Failed to delete");
      throw new Error(result.error);
    }
  }
);

const inquirySlice = createSlice({
  name: "inquiries",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInquiries.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInquiries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inquiries = action.payload;
      })
      .addCase(fetchInquiries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch inquiries";
      });
  },
});

export default inquirySlice.reducer;
