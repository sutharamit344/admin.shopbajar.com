import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addAreaAction, updateAreaAction } from "../../../store/locationSlice";
import { FormInputField } from "../../../components/formFields/FormInputField";
import { FormSelectField } from "../../../components/formFields/FormSelectField";
import { Button } from "../../../components/common/Button";
import { closed } from "../../../store/drawerSlice";
import { MapPinIcon } from "@heroicons/react/24/outline";

const validationSchema = Yup.object({
  name: Yup.string().required("Area name is required"),
  cityId: Yup.string().required("City is required"),
  pincode: Yup.string().required("Pincode is required"),
});

interface AreaValues {
  name: string;
  cityId: string;
  pincode: string;
  lat: string;
  lng: string;
}

export const AreaDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cities } = useAppSelector((state) => state.locations);
  const { data } = useAppSelector((state) => state.drawer);
  const isEdit = !!data?.id;

  const formik = useFormik<AreaValues>({
    initialValues: {
      name: data?.name || "",
      cityId: data?.cityId || "",
      pincode: data?.pincode || "",
      lat: data?.lat || "",
      lng: data?.lng || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (isEdit) {
        const result = await dispatch(updateAreaAction({ id: data.id, ...values }));
        if (updateAreaAction.fulfilled.match(result)) dispatch(closed());
      } else {
        const result = await dispatch(addAreaAction(values));
        if (addAreaAction.fulfilled.match(result)) dispatch(closed());
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col h-full bg-white">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-md border border-primary-100">
          <div className="p-2 bg-white rounded-md shadow-sm text-primary-600">
            <MapPinIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{isEdit ? "Edit Area" : "Add New Area"}</h3>
            <p className="text-xs text-gray-500">
              {isEdit ? "Update specific marketplace area." : "Create a new business area for your marketplace."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormInputField
            label="Area Name"
            name="name"
            placeholder="e.g. Salt Lake, Gota..."
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name ? (formik.errors.name as string) : ""}
          />
          <FormSelectField
            label="City"
            name="cityId"
            options={cities.map((c) => ({ value: c.id, label: c.name }))}
            value={formik.values.cityId}
            onChange={formik.handleChange}
            error={formik.touched.cityId && formik.errors.cityId ? (formik.errors.cityId as string) : ""}
          />
          <FormInputField
            label="Pincode"
            name="pincode"
            placeholder="e.g. 700091"
            value={formik.values.pincode}
            onChange={formik.handleChange}
            error={formik.touched.pincode && formik.errors.pincode ? (formik.errors.pincode as string) : ""}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInputField
              label="Latitude (Optional)"
              name="lat"
              value={formik.values.lat}
              onChange={formik.handleChange}
            />
            <FormInputField
              label="Longitude (Optional)"
              name="lng"
              value={formik.values.lng}
              onChange={formik.handleChange}
            />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
        <Button variant="outline" type="button" onClick={() => dispatch(closed())} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={formik.isSubmitting} className="flex-1">
          {isEdit ? "Update Area" : "Create Area"}
        </Button>
      </div>
    </form>
  );
};
