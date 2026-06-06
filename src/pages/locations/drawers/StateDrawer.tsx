import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addStateAction, updateStateAction } from "../../../store/locationSlice";
import { FormInputField } from "../../../components/formFields/FormInputField";
import { FormSelectField } from "../../../components/formFields/FormSelectField";
import { Button } from "../../../components/common/Button";
import { closed } from "../../../store/drawerSlice";
import { MapIcon } from "@heroicons/react/24/outline";

const validationSchema = Yup.object({
  name: Yup.string().required("State name is required"),
  countryId: Yup.string().required("Country is required"),
});

interface StateValues {
  name: string;
  countryId: string;
}

export const StateDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { countries } = useAppSelector((state) => state.locations);
  const { data } = useAppSelector((state) => state.drawer);
  const isEdit = !!data?.id;

  const formik = useFormik<StateValues>({
    initialValues: {
      name: data?.name || "",
      countryId: data?.countryId || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (isEdit) {
        const result = await dispatch(updateStateAction({ id: data.id, ...values }));
        if (updateStateAction.fulfilled.match(result)) dispatch(closed());
      } else {
        const result = await dispatch(addStateAction(values));
        if (addStateAction.fulfilled.match(result)) dispatch(closed());
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col h-full bg-white">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-md border border-primary-100">
          <div className="p-2 bg-white rounded-md shadow-sm text-primary-600">
            <MapIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{isEdit ? "Edit State" : "Add New State"}</h3>
            <p className="text-xs text-gray-500">
              {isEdit ? "Update state/province details." : "Add a new state to the geographic hierarchy."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormInputField
            label="State Name"
            name="name"
            placeholder="e.g. West Bengal, California..."
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name ? (formik.errors.name as string) : ""}
          />
          <FormSelectField
            label="Country"
            name="countryId"
            options={countries.map((c) => ({ value: c.id, label: c.name }))}
            value={formik.values.countryId}
            onChange={formik.handleChange}
            error={formik.touched.countryId && formik.errors.countryId ? (formik.errors.countryId as string) : ""}
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
        <Button variant="outline" type="button" onClick={() => dispatch(closed())} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={formik.isSubmitting} className="flex-1">
          {isEdit ? "Update State" : "Create State"}
        </Button>
      </div>
    </form>
  );
};
