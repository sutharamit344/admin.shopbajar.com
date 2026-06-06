import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { blogService, type Blog } from "../../firebaseservices/blog/blog.service";
import toast from "react-hot-toast";

export interface BlogState {
  blogs: Blog[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BlogState = {
  blogs: [],
  isLoading: false,
  error: null,
};

export const fetchBlogs = createAsyncThunk("blogs/fetchAll", async () => {
  return await blogService.getBlogs();
});

export const createBlogAction = createAsyncThunk(
  "blogs/create",
  async (data: Partial<Blog>, { dispatch }) => {
    const result = await blogService.addBlog(data);
    if (result.success) {
      toast.success("Article created");
      dispatch(fetchBlogs());
      return result.id;
    } else {
      toast.error("Failed to create");
      throw new Error(result.error);
    }
  }
);

export const updateBlogAction = createAsyncThunk(
  "blogs/update",
  async ({ id, data }: { id: string; data: Partial<Blog> }, { dispatch }) => {
    const result = await blogService.updateBlog(id, data);
    if (result.success) {
      toast.success("Article updated");
      dispatch(fetchBlogs());
    } else {
      toast.error("Failed to update");
      throw new Error(result.error);
    }
  }
);

export const deleteBlogAction = createAsyncThunk(
  "blogs/delete",
  async (id: string, { dispatch }) => {
    const result = await blogService.deleteBlog(id);
    if (result.success) {
      toast.success("Blog deleted");
      dispatch(fetchBlogs());
    } else {
      toast.error("Failed to delete");
      throw new Error(result.error);
    }
  }
);

const blogSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch blogs";
      });
  },
});

export default blogSlice.reducer;
