import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { addFeatureAction, updateFeatureAction } from "./featureSlice";
import { FormInputField } from "../../components/formFields/FormInputField";
import { FormSelectField } from "../../components/formFields/FormSelectField";
import { FormTextareaField } from "../../components/formFields/FormTextareaField";
import { Button } from "../../components/common/Button";
import { closed } from "../../store/drawerSlice";
import { TagIcon } from "@heroicons/react/24/outline";

const validationSchema = Yup.object({
  featureKey: Yup.string().required("Feature key is required"),
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  price: Yup.number().required("Price is required").min(0, "Price cannot be negative"),
  billingCycle: Yup.string().required("Billing cycle is required"),
  category: Yup.string().required("Category is required"),
  trialDays: Yup.number().required("Trial days is required").min(0, "Trial days cannot be negative"),
  icon: Yup.string().required("Icon name is required"),
  status: Yup.string().required("Status is required"),
});

interface FeatureValues {
  featureKey: string;
  title: string;
  description: string;
  price: number;
  billingCycle: string;
  category: string;
  trialDays: number;
  icon: string;
  status: "active" | "inactive";
}

export const FeatureDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data } = useAppSelector((state) => state.drawer);
  const isEdit = !!data?.id;

  const formik = useFormik<FeatureValues>({
    initialValues: {
      featureKey: data?.featureKey || "",
      title: data?.title || "",
      description: data?.description || "",
      price: data?.price || 499,
      billingCycle: data?.billingCycle || "monthly",
      category: data?.category || "Core E-Commerce",
      trialDays: data?.trialDays !== undefined ? data?.trialDays : 14,
      icon: data?.icon || "ShoppingBag",
      status: data?.status || "active",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (isEdit) {
        const result = await dispatch(updateFeatureAction({ id: data.id, featureData: values }));
        if (updateFeatureAction.fulfilled.match(result)) dispatch(closed());
      } else {
        const result = await dispatch(addFeatureAction(values));
        if (addFeatureAction.fulfilled.match(result)) dispatch(closed());
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col h-full bg-white">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-md border border-primary-100">
          <div className="p-2 bg-white rounded-md shadow-sm text-primary-600">
            <TagIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{isEdit ? "Edit Master Feature" : "Add Master Feature"}</h3>
            <p className="text-xs text-gray-500">
              {isEdit ? "Update SaaS add-on configuration." : "Define a new premium SaaS feature for merchants."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormInputField
            label="Feature Key (Unique ID)"
            name="featureKey"
            placeholder="e.g. addToCart, advancedAnalytics"
            value={formik.values.featureKey}
            onChange={formik.handleChange}
            error={formik.touched.featureKey && formik.errors.featureKey ? (formik.errors.featureKey as string) : ""}
            disabled={isEdit}
          />

          <FormInputField
            label="Display Title"
            name="title"
            placeholder="e.g. WhatsApp Add-to-Cart & Checkout"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && formik.errors.title ? (formik.errors.title as string) : ""}
          />

          <FormSelectField
            label="Category"
            name="category"
            value={formik.values.category}
            onChange={formik.handleChange}
            error={formik.touched.category && formik.errors.category ? (formik.errors.category as string) : ""}
            options={[
              { value: "Inquiry", label: "Inquiry" },
              { value: "Billing", label: "Billing" },
              { value: "Ordering", label: "Ordering" },
              { value: "Reservations", label: "Reservations" },
              { value: "Appointments", label: "Appointments" },
              { value: "Core E-Commerce", label: "Core E-Commerce" },
              { value: "Insights", label: "Insights" },
              { value: "Growth", label: "Growth" },
              { value: "Branding", label: "Branding" },
              { value: "Automation", label: "Automation" },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInputField
              label="Price (₹)"
              name="price"
              type="number"
              value={formik.values.price}
              onChange={formik.handleChange}
              error={formik.touched.price && formik.errors.price ? (formik.errors.price as string) : ""}
            />

            <FormSelectField
              label="Billing Cycle"
              name="billingCycle"
              value={formik.values.billingCycle}
              onChange={formik.handleChange}
              error={formik.touched.billingCycle && formik.errors.billingCycle ? (formik.errors.billingCycle as string) : ""}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual" },
                { value: "one-time", label: "One-time / Lifetime" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInputField
              label="Trial Days"
              name="trialDays"
              type="number"
              value={formik.values.trialDays}
              onChange={formik.handleChange}
              error={formik.touched.trialDays && formik.errors.trialDays ? (formik.errors.trialDays as string) : ""}
            />

            <FormSelectField
              label="Status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              error={formik.touched.status && formik.errors.status ? (formik.errors.status as string) : ""}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive / Legacy" },
              ]}
            />
          </div>

          <FormSelectField
            label="Icon Name"
            name="icon"
            value={formik.values.icon}
            onChange={formik.handleChange}
            error={formik.touched.icon && formik.errors.icon ? (formik.errors.icon as string) : ""}
            options={[
              { value: "Phone", label: "Phone" },
              { value: "LayoutDashboard", label: "Dashboard Layout" },
              { value: "Calculator", label: "Calculator" },
              { value: "QrCode", label: "QR Code" },
              { value: "CalendarDays", label: "Calendar Days" },
              { value: "ShoppingBag", label: "Shopping Bag" },
              { value: "TrendingUp", label: "Trending Up Chart" },
              { value: "Zap", label: "Lightning Zap" },
              { value: "Sparkles", label: "Sparkles" },
              { value: "Bot", label: "AI Bot" },
              { value: "Star", label: "Star" },
              { value: "Shield", label: "Shield" },
              { value: "Award", label: "Award Trophy" },
            ]}
          />

          <FormTextareaField
            label="Description"
            name="description"
            placeholder="Detailed description of capabilities unlocked..."
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && formik.errors.description ? (formik.errors.description as string) : ""}
            rows={4}
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
        <Button variant="outline" type="button" onClick={() => dispatch(closed())} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={formik.isSubmitting} className="flex-1">
          {isEdit ? "Update Feature" : "Create Feature"}
        </Button>
      </div>
    </form>
  );
};
