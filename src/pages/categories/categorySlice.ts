import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryService, type Category } from "../../firebaseservices/category/category.service";
import toast from "react-hot-toast";

export interface CategoryState {
  categories: Category[];
  pendingCategories: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  pendingCategories: [],
  isLoading: false,
  error: null,
};

export const fetchAllCategories = createAsyncThunk("categories/fetchAll", async () => {
  const [approved, pending] = await Promise.all([
    categoryService.getCategories(),
    categoryService.getPendingCategories(),
  ]);
  return { approved, pending };
});

export const addCategoryAction = createAsyncThunk(
  "categories/add",
  async ({ name, productViewType }: { name: string; productViewType?: "image" | "text" | "mini" }, { dispatch }) => {
    const result = await categoryService.addCategory(name, productViewType);
    if (result.success) {
      toast.success("Category added");
      dispatch(fetchAllCategories());
    } else {
      toast.error("Failed to add category");
      throw new Error(result.error);
    }
  }
);

export const approveCategoryAction = createAsyncThunk(
  "categories/approve",
  async (id: string, { dispatch }) => {
    const result = await categoryService.approveCategory(id);
    if (result.success) {
      toast.success("Category approved");
      dispatch(fetchAllCategories());
    } else {
      toast.error("Failed to approve");
      throw new Error(result.error);
    }
  }
);

export const deleteCategoryAction = createAsyncThunk(
  "categories/delete",
  async (id: string, { dispatch }) => {
    const result = await categoryService.deleteCategory(id);
    if (result.success) {
      toast.success("Category deleted");
      dispatch(fetchAllCategories());
    } else {
      toast.error("Failed to delete");
      throw new Error(result.error);
    }
  }
);

export const updateCategoryAction = createAsyncThunk(
  "categories/update",
  async ({ id, name, productViewType }: { id: string; name: string; productViewType?: "image" | "text" | "mini" }, { dispatch }) => {
    const result = await categoryService.updateCategory(id, name, productViewType);
    if (result.success) {
      toast.success("Category updated");
      dispatch(fetchAllCategories());
    } else {
      toast.error("Failed to update category");
      throw new Error(result.error);
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.approved;
        state.pendingCategories = action.payload.pending;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch categories";
      });
  },
});

export default categorySlice.reducer;
