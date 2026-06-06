import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authService } from "../../firebaseservices/auth/auth.service";
import toast from "react-hot-toast";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const localUser = localStorage.getItem("adminUser");
const initialUser = localUser ? JSON.parse(localUser) : null;

const initialState: AuthState = {
  user: initialUser,
  isLoading: false,
  error: null,
  isAuthenticated: !!initialUser,
};

export const loginWithGoogle = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>("auth/loginWithGoogle", async (_, { rejectWithValue }) => {
  try {
    const user = await authService.signInWithGoogle();
    if (!user) throw new Error("Login failed");

    // Check if admin
    const isAdmin = await authService.isUserAdmin();
    if (!isAdmin) {
      await authService.logout();
      throw new Error("Access denied: You are not an administrator.");
    }

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isAdmin: true,
    };

    localStorage.setItem("adminUser", JSON.stringify(profile));
    toast.success("Welcome, Admin!");
    return profile;
  } catch (error: any) {
    toast.error(error.message || "Login failed");
    return rejectWithValue(error.message);
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem("adminUser");
      toast.success("Logged out successfully");
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const loginSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser } = loginSlice.actions;
export default loginSlice.reducer;
