import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "../components/layout/sidebarSlice";
import authReducer from "../pages/login/loginSlice";
import dashboardReducer from "../pages/dashboard/dashboardSlice";
import shopReducer from "../pages/shops/shopSlice";
import categoryReducer from "../pages/categories/categorySlice";
import subCategoryReducer from "../pages/categories/subCategorySlice";
import clusterReducer from "../pages/clusters/clusterSlice";
import blogReducer from "../pages/marketing/blogSlice";
import inquiryReducer from "../pages/reports/inquirySlice";
import logReducer from "../pages/reports/logSlice";
import locationReducer from "../store/locationSlice";
import dialogReducer from "../store/dialogSlice";
import drawerReducer from "../store/drawerSlice";
import featureReducer from "../pages/features/featureSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sidebar: sidebarReducer,
    dashboard: dashboardReducer,
    shops: shopReducer,
    categories: categoryReducer,
    subcategories: subCategoryReducer,
    clusters: clusterReducer,
    blogs: blogReducer,
    inquiries: inquiryReducer,
    logs: logReducer,
    locations: locationReducer,
    features: featureReducer,
    dialog: dialogReducer,
    drawer: drawerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/login/fulfilled", "auth/signUp/fulfilled"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
