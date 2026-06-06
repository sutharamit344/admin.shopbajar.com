// src/store/drawerSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Anchor = "left" | "right" | "top" | "bottom";

export interface DrawerSliceState {
  id?: string | number | null;
  open?: boolean;
  anchor?: Anchor;
  name: string;
  drawerWidth?: number | string;
  data?: any;
  tooltip?: string;
  className?: string;
  navigate?: string;
  label?: string;
  isIndirect?: boolean;
  title?: string;
  component?: string;
}

const initialState: DrawerSliceState = {
  id: null,
  open: false,
  anchor: "right",
  name: "drawer",
  drawerWidth: 400,
  data: null,
  label: "",
  isIndirect: false,
  title: "",
  component: "",
};

const drawerSlice = createSlice({
  name: "drawer",
  initialState,
  reducers: {
    opened: (state, action: PayloadAction<DrawerSliceState>) => {
      Object.assign(state, action.payload);
      state.open = action.payload.open ?? true;
    },
    closed: (state) => {
      state.open = false;
    },
    updateDrawerData: (state, action: PayloadAction<any>) => {
      state.data = action.payload;
    },
    updateDrawerTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
  },
});

export const {
  opened,
  closed,
  updateDrawerData,
  updateDrawerTitle,
} = drawerSlice.actions;

export default drawerSlice.reducer;
