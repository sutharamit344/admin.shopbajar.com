import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addCityAction, updateCityAction } from "../../../store/locationSlice";
import { FormInputField } from "../../../components/formFields/FormInputField";
import { FormSelectField } from "../../../components/formFields/FormSelectField";
import { Button } from "../../../components/common/Button";
import { closed } from "../../../store/drawerSlice";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";

const validationSchema = Yup.object({
  name: Yup.string().required("City name is required"),
  stateId: Yup.string().required("State is required"),
});

interface CityValues {
  name: string;
  stateId: string;
}

export const CityDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { states } = useAppSelector((state) => state.locations);
  const { data } = useAppSelector((state) => state.drawer);
  const isEdit = !!data?.id;

  const formik = useFormik<CityValues>({
    initialValues: {
      name: data?.name || "",
      stateId: data?.stateId || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (isEdit) {
        const result = await dispatch(updateCityAction({ id: data.id, ...values }));
        if (updateCityAction.fulfilled.match(result)) dispatch(closed());
      } else {
        const result = await dispatch(addCityAction(values));
        if (addCityAction.fulfilled.match(result)) dispatch(closed());
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col h-full bg-white">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-md border border-primary-100">
          <div className="p-2 bg-white rounded-md shadow-sm text-primary-600">
            <BuildingOfficeIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{isEdit ? "Edit City" : "Add New City"}</h3>
            <p className="text-xs text-gray-500">
              {isEdit ? "Update city details." : "Add a new city to the geographic hierarchy."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormInputField
            label="City Name"
            name="name"
            placeholder="e.g. Kolkata, Ahmedabad..."
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name ? (formik.errors.name as string) : ""}
          />
          <FormSelectField
            label="State"
            name="stateId"
            options={states.map((s) => ({ value: s.id, label: s.name }))}
            value={formik.values.stateId}
            onChange={formik.handleChange}
            error={formik.touched.stateId && formik.errors.stateId ? (formik.errors.stateId as string) : ""}
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
        <Button variant="outline" type="button" onClick={() => dispatch(closed())} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={formik.isSubmitting} className="flex-1">
          {isEdit ? "Update City" : "Create City"}
        </Button>
      </div>
    </form>
  );
};
