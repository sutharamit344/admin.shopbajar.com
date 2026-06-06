import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { addClusterAction, updateClusterAction } from "./clusterSlice";
import { FormInputField } from "../../components/formFields/FormInputField";
import { FormSelectField } from "../../components/formFields/FormSelectField";
import { Button } from "../../components/common/Button";
import { closed } from "../../store/drawerSlice";
import { MapPinIcon } from "@heroicons/react/24/outline";

const validationSchema = Yup.object({
  name: Yup.string().required("Cluster name is required"),
  category: Yup.string().required("Category is required"),
  city: Yup.string().required("City is required"),
  area: Yup.string().required("Area is required"),
});

interface ClusterValues {
  name: string;
  category: string;
  city: string;
  area: string;
  pincode: string;
}

export const ClusterDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data } = useAppSelector((state) => state.drawer);
  const { cities, areas } = useAppSelector((state) => state.locations);
  const isEdit = !!data?.id;

  const formik = useFormik<ClusterValues>({
    initialValues: {
      name: data?.name || "",
      category: data?.category || "",
      city: data?.city || "",
      area: data?.area || "",
      pincode: data?.pincode || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (isEdit) {
        const result = await dispatch(updateClusterAction({ id: data.id, ...values }));
        if (updateClusterAction.fulfilled.match(result)) dispatch(closed());
      } else {
        const result = await dispatch(addClusterAction(values));
        if (addClusterAction.fulfilled.match(result)) dispatch(closed());
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
            <h3 className="font-bold text-gray-900">{isEdit ? "Edit Cluster" : "Add New Cluster"}</h3>
            <p className="text-xs text-gray-500">
              {isEdit ? "Update business hub details." : "Create a new geo-fenced business cluster."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormInputField
            label="Cluster Name"
            name="name"
            placeholder="e.g. IT Hub, Textile Market..."
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name ? (formik.errors.name as string) : ""}
          />
          <FormInputField
            label="Category"
            name="category"
            placeholder="e.g. Technology, Apparel..."
            value={formik.values.category}
            onChange={formik.handleChange}
            error={formik.touched.category && formik.errors.category ? (formik.errors.category as string) : ""}
          />
          <FormSelectField
            label="City"
            name="city"
            options={cities.map((c) => ({ value: c.name, label: c.name }))}
            value={formik.values.city}
            onChange={formik.handleChange}
            error={formik.touched.city && formik.errors.city ? (formik.errors.city as string) : ""}
          />
          <FormSelectField
            label="Area"
            name="area"
            options={areas
              .filter((a) => {
                const selectedCityId = cities.find((c) => c.name === formik.values.city)?.id;
                return !formik.values.city || a.cityId === selectedCityId;
              })
              .map((a) => ({ value: a.name, label: a.name }))}
            value={formik.values.area}
            onChange={formik.handleChange}
            error={formik.touched.area && formik.errors.area ? (formik.errors.area as string) : ""}
          />
          <FormInputField
            label="Pincode"
            name="pincode"
            value={formik.values.pincode}
            onChange={formik.handleChange}
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
        <Button variant="outline" type="button" onClick={() => dispatch(closed())} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={formik.isSubmitting} className="flex-1">
          {isEdit ? "Update Cluster" : "Create Cluster"}
        </Button>
      </div>
    </form>
  );
};
