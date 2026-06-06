import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { updateShopAction } from "./shopSlice";
import { FormInputField } from "../../components/formFields/FormInputField";
import { FormSelectField } from "../../components/formFields/FormSelectField";
import { FormTextareaField } from "../../components/formFields/FormTextareaField";
import { ImageUpload } from "../../components/common/ImageUpload";
import { Button } from "../../components/common/Button";
import { closed } from "../../store/drawerSlice";
import {
  IdentificationIcon,
  MapPinIcon,
  PhoneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { fetchAllLocations } from "../../store/locationSlice";
import { fetchAllClusters } from "../clusters/clusterSlice";
import { fetchAllCategories } from "../categories/categorySlice";
const validationSchema = Yup.object({
  name: Yup.string().required("Shop name is required"),
  category: Yup.string().required("Category is required"),
  city: Yup.string().required("City is required"),
  area: Yup.string().required("Area is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "WhatsApp number must be exactly 10 digits")
    .required("WhatsApp number is required"),
  ownerEmail: Yup.string()
    .email("Invalid email address")
    .required("Owner Email is required"),
});

export const EditShopDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, open } = useAppSelector((state) => state.drawer);
  const { cities, areas, states, countries } = useAppSelector((state) => state.locations);
  const { categories } = useAppSelector((state) => state.categories);
  const { clusters } = useAppSelector((state) => state.clusters);

  const [expandedSection, setExpandedSection] = useState<string | null>(
    "identity",
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      category: "",
      businessType: "mixed",
      description: "",
      logo: "",
      coverImage: "",
      shopNo: "",
      building: "",
      area: "",
      village: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      zone: "",
      clusterType: "",
      lat: "",
      lng: "",
      mapEmbed: "",
      phone: "",
      ownerEmail: "",
      primaryColor: "#FF6A00",
      secondaryColor: "#1A1F36",
      rating: "5.0",
      status: "approved",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (data?.id) {
        const result = await dispatch(
          updateShopAction({ id: data.id, data: values as any }),
        );
        if (updateShopAction.fulfilled.match(result)) {
          dispatch(closed());
        }
      }
    },
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchAllLocations());
      dispatch(fetchAllClusters());
      dispatch(fetchAllCategories());
    }
  }, [dispatch, open]);

  useEffect(() => {
    if (data && open) {
      formik.setValues({
        name: data.name || "",
        category: data.category || "",
        businessType: data.businessType || "mixed",
        description: data.description || "",
        logo: data.logo || "",
        coverImage: data.coverImage || "",
        shopNo: data.shopNo || "",
        building: data.building || "",
        area: data.area || "",
        village: data.village || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "India",
        pincode: data.pincode || "",
        zone: data.zone || "",
        clusterType: data.clusterType || "",
        lat: data.lat || "",
        lng: data.lng || "",
        mapEmbed: data.mapEmbed || "",
        phone: data.phone || "",
        ownerEmail: data.ownerEmail || "",
        primaryColor: data.primaryColor || "#FF6A00",
        secondaryColor: data.secondaryColor || "#1A1F36",
        rating: data.rating || "5.0",
        status: data.status || "approved",
      });
    }
  }, [data, open]);

  // Hierarchical filtering logic
  const countryOptions = countries.map((c) => ({ value: c.name, label: c.name }));

  const selectedCountryId = countries.find((c) => c.name === formik.values.country)?.id;
  const filteredStates = states.filter((s) => !selectedCountryId || s.countryId === selectedCountryId);
  const stateOptions = filteredStates.map((s) => ({ value: s.name, label: s.name }));

  const selectedStateId = states.find((s) => s.name === formik.values.state)?.id;
  const filteredCities = cities.filter((c) => !selectedStateId || c.stateId === selectedStateId);
  const cityOptions = filteredCities.map((c) => ({ value: c.name, label: c.name }));

  const selectedCityId = cities.find((c) => c.name === formik.values.city)?.id;
  const filteredAreas = areas.filter((a) => !selectedCityId || a.cityId === selectedCityId);
  const areaOptions = filteredAreas.map((a) => ({ value: a.name, label: a.name }));

  const clusterOptions = clusters.map((c) => ({ value: c.name, label: c.name }));

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.handleChange(e);
    formik.setFieldValue("state", "");
    formik.setFieldValue("city", "");
    formik.setFieldValue("area", "");
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.handleChange(e);
    formik.setFieldValue("city", "");
    formik.setFieldValue("area", "");
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.handleChange(e);
    formik.setFieldValue("area", "");
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.handleChange(e);
    const area = areas.find((a) => a.name === e.target.value);
    if (area) {
      if (area.lat) formik.setFieldValue("lat", area.lat);
      if (area.lng) formik.setFieldValue("lng", area.lng);
      if (area.pincode) formik.setFieldValue("pincode", area.pincode);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(-10);
    formik.setFieldValue("phone", value);
  };

  const getCountryCode = (countryName: string) => {
    const codes: Record<string, string> = {
      "India": "+91",
      "United Arab Emirates": "+971",
      "Saudi Arabia": "+966",
      "USA": "+1"
    };
    return codes[countryName] || "+91";
  };

  const SectionHeader = ({
    title,
    icon: Icon,
    section,
  }: {
    title: string;
    icon: any;
    section: string;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors border-y border-gray-100"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-gray-500" />
        <span className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
          {title}
        </span>
      </div>
      {expandedSection === section ? (
        <ChevronUpIcon className="w-4 h-4" />
      ) : (
        <ChevronDownIcon className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col h-full bg-white"
    >
      <div className="flex-1 overflow-y-auto">
        {/* Identity Section */}
        <SectionHeader
          title="Shop Identity"
          icon={IdentificationIcon}
          section="identity"
        />
        {expandedSection === "identity" && (
          <div className="p-4 space-y-4 animate-in slide-in-from-top-2">
            <FormInputField
              label="Shop Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={
                formik.touched.name && formik.errors.name
                  ? formik.errors.name
                  : ""
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelectField
                label="Category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                options={[
                  { value: "", label: "Select Category" },
                  ...categories.map((c) => ({ value: c.name, label: c.name })),
                ]}
                error={
                  formik.touched.category && formik.errors.category
                    ? (formik.errors.category as string)
                    : ""
                }
              />
              <FormSelectField
                label="Type"
                name="businessType"
                value={formik.values.businessType}
                onChange={formik.handleChange}
                options={[
                  { value: "product", label: "Product" },
                  { value: "service", label: "Service" },
                  { value: "mixed", label: "Mixed" },
                ]}
              />
            </div>
            <FormTextareaField
              label="Description"
              name="description"
              rows={2}
              value={formik.values.description}
              onChange={formik.handleChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <ImageUpload
                label="Logo"
                value={formik.values.logo}
                onChange={(url) => formik.setFieldValue("logo", url)}
              />
              <ImageUpload
                label="Cover"
                value={formik.values.coverImage}
                onChange={(url) => formik.setFieldValue("coverImage", url)}
              />
            </div>
          </div>
        )}

        {/* Location Section */}
        <SectionHeader
          title="Location Details"
          icon={MapPinIcon}
          section="location"
        />
        {expandedSection === "location" && (
          <div className="p-4 space-y-4 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-4">
              <FormInputField
                label="Shop No"
                name="shopNo"
                value={formik.values.shopNo}
                onChange={formik.handleChange}
              />
              <FormInputField
                label="Building"
                name="building"
                value={formik.values.building}
                onChange={formik.handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormSelectField
                label="Country"
                name="country"
                value={formik.values.country}
                onChange={handleCountryChange}
                options={[
                  { value: "", label: "Select Country" },
                  ...countryOptions,
                ]}
              />
              <FormSelectField
                label="State"
                name="state"
                value={formik.values.state}
                onChange={handleStateChange}
                options={[{ value: "", label: "Select State" }, ...stateOptions]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormSelectField
                label="City"
                name="city"
                value={formik.values.city}
                onChange={handleCityChange}
                options={[{ value: "", label: "Select City" }, ...cityOptions]}
                error={
                  formik.touched.city && formik.errors.city
                    ? (formik.errors.city as string)
                    : ""
                }
              />
              <FormSelectField
                label="Area"
                name="area"
                value={formik.values.area}
                onChange={handleAreaChange}
                options={[{ value: "", label: "Select Area" }, ...areaOptions]}
                error={
                  formik.touched.area && formik.errors.area
                    ? (formik.errors.area as string)
                    : ""
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInputField
                label="Pincode"
                name="pincode"
                value={formik.values.pincode}
                onChange={formik.handleChange}
              />
              <FormSelectField
                label="Market Area / Cluster"
                name="clusterType"
                value={formik.values.clusterType}
                onChange={formik.handleChange}
                options={[
                  { value: "", label: "Select Cluster" },
                  ...clusterOptions,
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInputField
                label="Lat"
                name="lat"
                value={formik.values.lat}
                onChange={formik.handleChange}
              />
              <FormInputField
                label="Lng"
                name="lng"
                value={formik.values.lng}
                onChange={formik.handleChange}
              />
            </div>
            <FormInputField
              label="Map URL"
              name="mapEmbed"
              value={formik.values.mapEmbed}
              onChange={formik.handleChange}
            />
          </div>
        )}

        {/* Contact & Config Section */}
        <SectionHeader
          title="Contact & Config"
          icon={PhoneIcon}
          section="contact"
        />
        {expandedSection === "contact" && (
          <div className="p-4 space-y-4 animate-in slide-in-from-top-2">
            <FormInputField
              label="WhatsApp"
              name="phone"
              value={formik.values.phone}
              onChange={handlePhoneChange}
              prefix={getCountryCode(formik.values.country)}
            />
            <FormInputField
              label="Email"
              name="ownerEmail"
              value={formik.values.ownerEmail}
              onChange={formik.handleChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInputField
                label="Primary Color"
                name="primaryColor"
                type="color"
                value={formik.values.primaryColor}
                onChange={formik.handleChange}
              />
              <FormInputField
                label="Secondary"
                name="secondaryColor"
                type="color"
                value={formik.values.secondaryColor}
                onChange={formik.handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInputField
                label="Rating"
                name="rating"
                type="number"
                step="0.1"
                value={formik.values.rating}
                onChange={formik.handleChange}
              />
              <FormSelectField
                label="Status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                options={[
                  { value: "approved", label: "Approved" },
                  { value: "pending", label: "Pending" },
                  { value: "rejected", label: "Rejected" },
                ]}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={() => dispatch(closed())}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          isLoading={formik.isSubmitting}
          className="flex-1"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};
