import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { addCategoryAction, updateCategoryAction } from "./categorySlice";
import { FormInputField } from "../../components/formFields/FormInputField";
import { Button } from "../../components/common/Button";
import { closed } from "../../store/drawerSlice";
import { TagIcon } from "@heroicons/react/24/outline";

const validationSchema = Yup.object({
  name: Yup.string().required("Category name is required"),
});

interface CategoryValues {
  name: string;
  productViewType: "image" | "text" | "mini";
}

export const CategoryDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data } = useAppSelector((state) => state.drawer);
  const isEdit = !!data?.id;

  const formik = useFormik<CategoryValues>({
    initialValues: {
      name: data?.name || "",
      productViewType: data?.productViewType || "image",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (isEdit) {
        const result = await dispatch(updateCategoryAction({ id: data.id, ...values }));
        if (updateCategoryAction.fulfilled.match(result)) dispatch(closed());
      } else {
        const result = await dispatch(addCategoryAction(values));
        if (addCategoryAction.fulfilled.match(result)) dispatch(closed());
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col h-full bg-white">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-md border border-primary-100">
          <div className="p-2 bg-white rounded-md shadow-sm text-primary-600">
            <TagIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{isEdit ? "Edit Category" : "Add New Category"}</h3>
            <p className="text-xs text-gray-500">
              {isEdit ? "Update category details." : "Create a new product or shop category."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <FormInputField
            label="Category Name"
            name="name"
            placeholder="e.g. Grocery, Fashion..."
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name ? (formik.errors.name as string) : ""}
          />

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Product View Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "image", label: "Image Card", desc: "Default card with large image" },
                { id: "text", label: "Simple Text", desc: "Without image, clean list" },
                { id: "mini", label: "Mini Card", desc: "Compact card with small image" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => formik.setFieldValue("productViewType", opt.id)}
                  className={`p-3 rounded-md border text-left flex flex-col justify-between transition-all ${formik.values.productViewType === opt.id
                    ? "border-primary-600 bg-primary-50/50 ring-2 ring-primary-600/20"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                >
                  <span className={`text-xs font-bold ${formik.values.productViewType === opt.id ? "text-primary-900" : "text-gray-900"}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1 leading-tight">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
        <Button variant="outline" type="button" onClick={() => dispatch(closed())} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={formik.isSubmitting} className="flex-1">
          {isEdit ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
};
