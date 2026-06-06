import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { addSubCategoryAction, updateSubCategoryAction } from "./subCategorySlice";
import { FormInputField } from "../../components/formFields/FormInputField";
import { FormSelectField } from "../../components/formFields/FormSelectField";
import { Button } from "../../components/common/Button";
import { closed } from "../../store/drawerSlice";
import { TagIcon } from "@heroicons/react/24/outline";

const validationSchema = Yup.object({
  name: Yup.string().required("Subcategory name is required"),
  parent: Yup.string().required("Parent category is required"),
});

interface SubCategoryValues {
  name: string;
  parent: string;
}

export const SubCategoryDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.categories);
  const { data } = useAppSelector((state) => state.drawer);
  const isEdit = !!data?.id;

  const formik = useFormik<SubCategoryValues>({
    initialValues: {
      name: data?.name || "",
      parent: data?.parentCategory || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (isEdit) {
        const result = await dispatch(updateSubCategoryAction({ id: data.id, ...values }));
        if (updateSubCategoryAction.fulfilled.match(result)) dispatch(closed());
      } else {
        const result = await dispatch(addSubCategoryAction(values));
        if (addSubCategoryAction.fulfilled.match(result)) dispatch(closed());
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
            <h3 className="font-bold text-gray-900">{isEdit ? "Edit Subcategory" : "Add New Subcategory"}</h3>
            <p className="text-xs text-gray-500">
              {isEdit ? "Update subcategory details." : "Create a specific niche within a primary industry."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormInputField
            label="Subcategory Name"
            name="name"
            placeholder="e.g. Mens Wear, Dairy Products..."
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name ? (formik.errors.name as string) : ""}
          />
          <FormSelectField
            label="Parent Category"
            name="parent"
            options={categories.map((c) => ({ value: c.name, label: c.name }))}
            value={formik.values.parent}
            onChange={formik.handleChange}
            error={formik.touched.parent && formik.errors.parent ? (formik.errors.parent as string) : ""}
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
        <Button variant="outline" type="button" onClick={() => dispatch(closed())} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={formik.isSubmitting} className="flex-1">
          {isEdit ? "Update Subcategory" : "Create Subcategory"}
        </Button>
      </div>
    </form>
  );
};
