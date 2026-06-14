import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { Login } from "../pages/login/Login";
import { ShopsPage } from "../pages/shops/ShopsPage";
import { AddShopPage } from "../pages/shops/AddShopPage";
import { CategoriesPage } from "../pages/categories/CategoriesPage";
import { SubCategoriesPage } from "../pages/categories/SubCategoriesPage";
import { ClustersPage } from "../pages/clusters/ClustersPage";
import { BlogsPage } from "../pages/marketing/BlogsPage";
import { InquiriesPage } from "../pages/reports/InquiriesPage";
import { LogsPage } from "../pages/reports/LogsPage";
import { LocationsPage } from "../pages/locations/LocationsPage";
import { DatabasePage } from "../pages/database/DatabasePage";
import { BlogFormPage } from "../pages/marketing/BlogFormPage";
import { FeaturesMasterPage } from "../pages/features/FeaturesMasterPage";
import { BookingsPage } from "../pages/bookings/BookingsPage";
import { Layout } from "../components/layout/Layout";
import { ProtectedRoute } from "./ProtectedRoute";

const MainRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/shops" element={<ShopsPage />} />
        <Route path="/shops/add" element={<AddShopPage />} />
        <Route path="/shops/edit/:id" element={<AddShopPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/subcategories" element={<SubCategoriesPage />} />
        <Route path="/clusters" element={<ClustersPage />} />
        <Route path="/features" element={<FeaturesMasterPage />} />
        <Route path="/marketing/blogs" element={<BlogsPage />} />
        <Route path="/marketing/blogs/add" element={<BlogFormPage />} />
        <Route path="/marketing/blogs/edit/:id" element={<BlogFormPage />} />
        <Route path="/reports/inquiries" element={<InquiriesPage />} />
        <Route path="/reports/logs" element={<LogsPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/database" element={<DatabasePage />} />
        <Route path="/users" element={<div>User Management (Pending)</div>} />
        <Route path="/moderation" element={<div>Moderation (Pending)</div>} />
        <Route path="/marketing" element={<div>Marketing (Pending)</div>} />
        <Route path="/reports" element={<div>Reports (Pending)</div>} />
      </Route>
    </Routes>
  );
};

export default MainRouter;
