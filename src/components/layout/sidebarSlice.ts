import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SidebarState {
  collapsed: boolean;
  openMenus: string[];
}

const initialState: SidebarState = {
  collapsed: false,
  openMenus: [],
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsed = action.payload;
    },
    toggleCollapsed: (state) => {
      state.collapsed = !state.collapsed;
    },
    toggleMenu: (state, action: PayloadAction<string>) => {
      const menuLabel = action.payload;
      if (state.openMenus.includes(menuLabel)) {
        state.openMenus = state.openMenus.filter((item) => item !== menuLabel);
      } else {
        state.openMenus.push(menuLabel);
      }
    },
  },
});

export const {
  setCollapsed,
  toggleCollapsed,
  toggleMenu,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
