import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addCountryAction, updateCountryAction } from "../../../store/locationSlice";
import { FormInputField } from "../../../components/formFields/FormInputField";
import { Button } from "../../../components/common/Button";
import { closed } from "../../../store/drawerSlice";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

const validationSchema = Yup.object({
  name: Yup.string().required("Country name is required"),
  code: Yup.string().required("Country code is required").max(5, "Too long"),
});

interface CountryValues {
  name: string;
  code: string;
}

export const CountryDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data } = useAppSelector((state) => state.drawer);
  const isEdit = !!data?.id;

  const formik = useFormik<CountryValues>({
    initialValues: {
      name: data?.name || "",
      code: data?.code || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (isEdit) {
        const result = await dispatch(updateCountryAction({ id: data.id, ...values }));
        if (updateCountryAction.fulfilled.match(result)) dispatch(closed());
      } else {
        const result = await dispatch(addCountryAction(values));
        if (addCountryAction.fulfilled.match(result)) dispatch(closed());
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col h-full bg-white">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-md border border-primary-100">
          <div className="p-2 bg-white rounded-md shadow-sm text-primary-600">
            <GlobeAltIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{isEdit ? "Edit Country" : "Add New Country"}</h3>
            <p className="text-xs text-gray-500">
              {isEdit ? "Update country details." : "Add a new sovereign state to the platform."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormInputField
            label="Country Name"
            name="name"
            placeholder="e.g. India, United States..."
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name ? (formik.errors.name as string) : ""}
          />
          <FormInputField
            label="Country Code"
            name="code"
            placeholder="e.g. IN, US, UK..."
            value={formik.values.code}
            onChange={formik.handleChange}
            error={formik.touched.code && formik.errors.code ? (formik.errors.code as string) : ""}
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
        <Button variant="outline" type="button" onClick={() => dispatch(closed())} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={formik.isSubmitting} className="flex-1">
          {isEdit ? "Update Country" : "Create Country"}
        </Button>
      </div>
    </form>
  );
};
