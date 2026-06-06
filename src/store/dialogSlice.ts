import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface IDeleteItem {
  id: number | string;
  dialogName: string;
  name: string;
  type: string;
}

export interface IDialogState {
  open: boolean;
  loading: boolean;
  error: string | null;
  dialog: Record<string, IDeleteItem[]>;
}

const initialState: IDialogState = {
  open: false,
  loading: false,
  error: "",
  dialog: {},
};

const dialogSlice = createSlice({
  name: "dialog",
  initialState,
  reducers: {
    openDialog: (state, action: PayloadAction<IDeleteItem>) => {
      state.open = true;
      const { dialogName } = action.payload;
      state.dialog[dialogName] = [
        ...(state.dialog[dialogName] || []),
        action.payload,
      ];
    },
    closeDialog: (state, action: PayloadAction<string>) => {
      state.open = false;
      state.dialog[action.payload] = [];
    },
    clearDialogs: (state) => {
      state.open = false;
      state.dialog = {};
    },
  },
});

export default dialogSlice.reducer;
export const { openDialog, closeDialog, clearDialogs } = dialogSlice.actions;
