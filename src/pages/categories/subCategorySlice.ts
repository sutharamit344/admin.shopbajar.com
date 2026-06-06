import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryService } from "../../firebaseservices/category/category.service";
import toast from "react-hot-toast";

export interface SubCategory {
  id: string;
  name: string;
  parentCategory: string;
  createdAt: string;
}

export interface SubCategoryState {
  subCategories: SubCategory[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubCategoryState = {
  subCategories: [],
  isLoading: false,
  error: null,
};

export const fetchSubCategories = createAsyncThunk("subcategories/fetchAll", async () => {
  return await categoryService.getSubCategories();
});

export const addSubCategoryAction = createAsyncThunk(
  "subcategories/add",
  async ({ name, parent }: { name: string; parent: string }, { dispatch }) => {
    const result = await categoryService.addSubCategory(name, parent);
    if (result.success) {
      toast.success("Subcategory added");
      dispatch(fetchSubCategories());
    } else {
      toast.error("Failed to add subcategory");
      throw new Error(result.error);
    }
  }
);

export const deleteSubCategoryAction = createAsyncThunk(
  "subcategories/delete",
  async (id: string, { dispatch }) => {
    const result = await categoryService.deleteSubCategory(id);
    if (result.success) {
      toast.success("Subcategory deleted");
      dispatch(fetchSubCategories());
    } else {
      toast.error("Failed to delete");
      throw new Error(result.error);
    }
  }
);

export const updateSubCategoryAction = createAsyncThunk(
  "subcategories/update",
  async ({ id, name, parent }: { id: string; name: string; parent: string }, { dispatch }) => {
    const result = await categoryService.updateSubCategory(id, name, parent);
    if (result.success) {
      toast.success("Subcategory updated");
      dispatch(fetchSubCategories());
    } else {
      toast.error("Failed to update subcategory");
      throw new Error(result.error);
    }
  }
);

const subCategorySlice = createSlice({
  name: "subcategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subCategories = action.payload;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch subcategories";
      });
  },
});

export default subCategorySlice.reducer;
