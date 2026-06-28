// src/pages/shops/AddShopPage.tsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createShopAction,
  updateShopAction,
  fetchShopByIdAction,
} from "./shopSlice";
import { useNavigate, useParams } from "react-router-dom";
import { FormInputField } from "../../components/formFields/FormInputField";
import { FormSelectField } from "../../components/formFields/FormSelectField";
import { FormTextareaField } from "../../components/formFields/FormTextareaField";
import { ImageUpload } from "../../components/common/ImageUpload";
import { Button } from "../../components/common/Button";
import {
  ChevronLeftIcon,
  MapPinIcon,
  IdentificationIcon,
  PhoneIcon,
  SwatchIcon,
  TrashIcon,
  PlusIcon,
  ShareIcon,
  ClockIcon,
  CalendarIcon,
  SparklesIcon,
  ShoppingBagIcon,
  TruckIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { slugify } from "../../utils/helper";
import { shopService } from "../../firebaseservices/shop/shop.service";
import { fetchAllLocations } from "../../store/locationSlice";
import { fetchAllClusters } from "../clusters/clusterSlice";

const isVideoUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  if (url.startsWith("data:")) {
    return url.startsWith("data:video/");
  }
  const pathPart = url.split("?")[0].toLowerCase();
  return (
    pathPart.endsWith(".mp4") ||
    pathPart.endsWith(".webm") ||
    pathPart.endsWith(".ogg") ||
    pathPart.endsWith(".mov") ||
    pathPart.endsWith(".m4v") ||
    pathPart.endsWith(".quicktime")
  );
};

const countCatalogVideos = (menu: any[]): number => {
  if (!menu) return 0;
  let count = 0;
  for (const cat of menu) {
    if (cat.items) {
      for (const item of cat.items) {
        if (item.image && isVideoUrl(item.image)) {
          count++;
        }
      }
    }
  }
  return count;
};
import { fetchAllFeatures } from "../features/featureSlice";

const validationSchema = Yup.object({
  name: Yup.string().required("Shop name is required"),
  slug: Yup.string().required("Slug is required"),
  category: Yup.string().required("Category is required"),
  city: Yup.string().required("City is required"),
  area: Yup.string().required("Area is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "WhatsApp number must be exactly 10 digits")
    .required("WhatsApp number is required"),
  ownerEmail: Yup.string()
    .email("Invalid email address")
    .optional(),
});

export const AddShopPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [activeTab, setActiveTab] = useState<string>("identity");

  const { cities, areas, states, countries } = useAppSelector(
    (state) => state.locations,
  );
  const { categories } = useAppSelector((state) => state.categories);
  const { clusters } = useAppSelector((state) => state.clusters);
  const { features } = useAppSelector((state) => state.features);
  
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [isSlugCustom, setIsSlugCustom] = useState(false);

  // Catalog Item Drawer state
  const [editingItem, setEditingItem] = useState<{
    catIndex: number;
    itemIndex: number | null;
    name: string;
    price: string;
    description: string;
    image: string;
    featured: boolean;
    isNew: boolean;
    diet: string;
    trackStock: boolean;
    stock: string;
    isService: boolean;
    serviceDuration: string;
    highlights: string[];
    highlightsLabel: string;
  } | null>(null);

  const [newHighlight, setNewHighlight] = useState("");

  useEffect(() => {
    dispatch(fetchAllLocations());
    dispatch(fetchAllClusters());
    dispatch(fetchAllFeatures());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: "",
      slug: "",
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
      hasDelivery: false,
      deliveryMessage: "",

      primaryColor: "#FF6A00",
      secondaryColor: "#1A1F36",
      rating: "5.0",
      status: "approved",
      isVerified: false,
      socialLinks: [] as { platform: string; url: string }[],
      openingHoursDetails: {
        monday: { isClosed: false, open: "09:00", close: "21:00" },
        tuesday: { isClosed: false, open: "09:00", close: "21:00" },
        wednesday: { isClosed: false, open: "09:00", close: "21:00" },
        thursday: { isClosed: false, open: "09:00", close: "21:00" },
        friday: { isClosed: false, open: "09:00", close: "21:00" },
        saturday: { isClosed: false, open: "09:00", close: "21:00" },
        sunday: { isClosed: true, open: "09:00", close: "21:00" },
      } as Record<string, { isClosed: boolean; open: string; close: string }>,
      holidays: [] as { date: string; name: string }[],
      paidFeatures: {} as Record<
        string,
        {
          enabled: boolean;
          status: string;
          billingCycle: string;
          activatedAt?: number;
        }
      >,
      menu: [] as {
        name: string;
        items: {
          name: string;
          price: number | string;
          description: string;
          image: string;
          featured: boolean;
          isNew?: boolean;
          diet?: string;
          stock?: string;
          serviceDetails?: {
            isService: boolean;
            duration: number;
          };
          highlights?: string[];
          highlightsLabel?: string;
        }[];
      }[],
    },
    validationSchema,
    onSubmit: async (values) => {
      if (slugStatus === "taken") {
        alert("This shop URL is already taken. Please choose another one.");
        return;
      }
      if (slugStatus === "invalid") {
        alert("Invalid URL slug. Only lowercase letters, numbers, and hyphens are allowed.");
        return;
      }
      if (slugStatus === "checking") {
        alert("Checking URL availability... Please wait.");
        return;
      }

      if (isEdit && id) {
        const result = await dispatch(
          updateShopAction({ id, data: values as any }),
        );
        if (updateShopAction.fulfilled.match(result)) {
          navigate("/shops");
        }
      } else {
        const result = await dispatch(createShopAction(values as any));
        if (createShopAction.fulfilled.match(result)) {
          navigate("/shops");
        }
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchShopByIdAction(id)).then((res) => {
        if (fetchShopByIdAction.fulfilled.match(res)) {
          const shop = res.payload;
          formik.setValues({
            name: shop.name || "",
            slug: shop.slug || "",
            category: shop.category || "",
            businessType: shop.businessType || "mixed",
            description: shop.description || "",
            logo: shop.logo || "",
            coverImage: shop.coverImage || "",
            shopNo: shop.shopNo || "",
            building: shop.building || "",
            area: shop.area || "",
            village: shop.village || "",
            city: shop.city || "",
            state: shop.state || "",
            country: shop.country || "India",
            pincode: shop.pincode || "",
            zone: shop.zone || "",
            clusterType: shop.clusterType || "",
            lat: shop.lat || "",
            lng: shop.lng || "",
            mapEmbed: shop.mapEmbed || "",
            phone: shop.phone || "",
            ownerEmail: shop.ownerEmail || "",
            hasDelivery: shop.hasDelivery || false,
            deliveryMessage: shop.deliveryMessage || "",
            primaryColor: shop.primaryColor || "#FF6A00",
            secondaryColor: shop.secondaryColor || "#1A1F36",
            rating: shop.rating || "5.0",
            status: shop.status || "approved",
            isVerified: !!shop.isVerified,
            socialLinks: Array.isArray(shop.socialLinks)
              ? shop.socialLinks
              : [],
            openingHoursDetails: shop.openingHoursDetails || {
              monday: { isClosed: false, open: "09:00", close: "21:00" },
              tuesday: { isClosed: false, open: "09:00", close: "21:00" },
              wednesday: { isClosed: false, open: "09:00", close: "21:00" },
              thursday: { isClosed: false, open: "09:00", close: "21:00" },
              friday: { isClosed: false, open: "09:00", close: "21:00" },
              saturday: { isClosed: false, open: "09:00", close: "21:00" },
              sunday: { isClosed: true, open: "09:00", close: "21:00" },
            },
            holidays: Array.isArray(shop.holidays) ? shop.holidays : [],
            paidFeatures: shop.paidFeatures || {},
            menu: Array.isArray(shop.menu) ? shop.menu : [],
          });
          if (shop.slug) setIsSlugCustom(true);
        }
      });
    }
  }, [id, isEdit, dispatch]);

  // Debounced slug availability check
  useEffect(() => {
    if (!formik.values.slug || formik.values.slug.trim() === "") {
      setSlugStatus("idle");
      return;
    }

    const cleanSlug = formik.values.slug.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      setSlugStatus("invalid");
      return;
    }

    setSlugStatus("checking");

    const timer = setTimeout(async () => {
      const isAvailable = await shopService.isSlugAvailable(cleanSlug, isEdit ? id : null);
      if (isAvailable) {
        setSlugStatus("available");
      } else {
        setSlugStatus("taken");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formik.values.slug, isEdit, id]);

  // Hierarchical filtering logic
  const countryOptions = countries.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  const selectedCountryId = countries.find(
    (c) => c.name === formik.values.country,
  )?.id;
  const filteredStates = states.filter(
    (s) => !selectedCountryId || s.countryId === selectedCountryId,
  );
  const stateOptions = filteredStates.map((s) => ({
    value: s.name,
    label: s.name,
  }));

  const selectedStateId = states.find(
    (s) => s.name === formik.values.state,
  )?.id;
  const filteredCities = cities.filter(
    (c) => !selectedStateId || c.stateId === selectedStateId,
  );
  const cityOptions = filteredCities.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  const selectedCityId = cities.find((c) => c.name === formik.values.city)?.id;
  const filteredAreas = areas.filter(
    (a) => !selectedCityId || a.cityId === selectedCityId,
  );
  const areaOptions = filteredAreas.map((a) => ({
    value: a.name,
    label: a.name,
  }));

  const clusterOptions = clusters.map((c) => ({
    value: c.name,
    label: c.name,
  }));

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
      India: "+91",
      "United Arab Emirates": "+971",
      "Saudi Arabia": "+966",
      USA: "+1",
    };
    return codes[countryName] || "+91";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    formik.setFieldValue("name", name);
    if (!isSlugCustom && !isEdit) {
      formik.setFieldValue("slug", slugify(name));
    }
  };

  const socialPlatforms = [
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "youtube", label: "YouTube" },
    { value: "twitter", label: "Twitter / X" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "website", label: "Custom Website" },
  ];

  const handleAddSocialLink = () => {
    formik.setFieldValue("socialLinks", [
      ...formik.values.socialLinks,
      { platform: "instagram", url: "" },
    ]);
  };

  const handleRemoveSocialLink = (index: number) => {
    const updated = formik.values.socialLinks.filter((_, i) => i !== index);
    formik.setFieldValue("socialLinks", updated);
  };

  const handleSocialLinkChange = (
    index: number,
    field: "platform" | "url",
    value: string,
  ) => {
    const updated = [...formik.values.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    formik.setFieldValue("socialLinks", updated);
  };

  const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const handleOpeningHoursChange = (
    day: string,
    field: "isClosed" | "open" | "close",
    value: any,
  ) => {
    formik.setFieldValue(`openingHoursDetails.${day}.${field}`, value);
  };

  const handleAddHoliday = () => {
    formik.setFieldValue("holidays", [
      ...formik.values.holidays,
      { date: new Date().toISOString().split("T")[0], name: "New Holiday" },
    ]);
  };

  const handleRemoveHoliday = (index: number) => {
    const updated = formik.values.holidays.filter((_, i) => i !== index);
    formik.setFieldValue("holidays", updated);
  };

  const handleHolidayChange = (
    index: number,
    field: "date" | "name",
    value: string,
  ) => {
    const updated = [...formik.values.holidays];
    updated[index] = { ...updated[index], [field]: value };
    formik.setFieldValue("holidays", updated);
  };

  const handleTogglePaidFeature = (
    featureKey: string,
    defaultBillingCycle: string,
  ) => {
    const current = formik.values.paidFeatures[featureKey];
    if (current) {
      const updated = { ...formik.values.paidFeatures };
      delete updated[featureKey];
      formik.setFieldValue("paidFeatures", updated);
    } else {
      formik.setFieldValue(`paidFeatures.${featureKey}`, {
        enabled: true,
        status: "active",
        billingCycle: defaultBillingCycle || "monthly",
        activatedAt: Date.now(),
      });
    }
  };

  const handlePaidFeatureFieldChange = (
    featureKey: string,
    field: string,
    value: any,
  ) => {
    formik.setFieldValue(`paidFeatures.${featureKey}.${field}`, value);
  };

  const handleAddMenuCategory = () => {
    formik.setFieldValue("menu", [
      ...formik.values.menu,
      { name: "New Category", items: [] },
    ]);
  };

  const handleRemoveMenuCategory = (catIndex: number) => {
    const updated = formik.values.menu.filter((_, i) => i !== catIndex);
    formik.setFieldValue("menu", updated);
  };

  const handleMenuCategoryNameChange = (catIndex: number, value: string) => {
    const updated = [...formik.values.menu];
    updated[catIndex] = { ...updated[catIndex], name: value };
    formik.setFieldValue("menu", updated);
  };

  const handleAddMenuItem = (catIndex: number) => {
    setEditingItem({
      catIndex,
      itemIndex: null,
      name: "",
      price: "",
      description: "",
      image: "",
      featured: false,
      isNew: true,
      diet: "",
      trackStock: false,
      stock: "",
      isService: false,
      serviceDuration: "30",
      highlights: [],
      highlightsLabel: "Highlights",
    });
    setNewHighlight("");
  };

  const handleEditMenuItem = (catIndex: number, itemIndex: number) => {
    const item = formik.values.menu[catIndex].items[itemIndex];
    const hasStock = item.stock !== undefined && item.stock !== null && item.stock !== "";
    const isServ = !!item.serviceDetails?.isService;
    setEditingItem({
      catIndex,
      itemIndex,
      name: item.name || "",
      price: item.price !== undefined && item.price !== null ? item.price.toString() : "",
      description: item.description || "",
      image: item.image || "",
      featured: !!item.featured,
      isNew: item.isNew !== false,
      diet: item.diet || "",
      trackStock: hasStock,
      stock: (hasStock && item.stock !== undefined && item.stock !== null) ? item.stock.toString() : "",
      isService: isServ,
      serviceDuration: item.serviceDetails?.duration?.toString() || "30",
      highlights: item.highlights || [],
      highlightsLabel: item.highlightsLabel || "Highlights",
    });
    setNewHighlight("");
  };

  const handleRemoveMenuItem = (catIndex: number, itemIndex: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const updated = [...formik.values.menu];
      const items = updated[catIndex].items.filter((_, i) => i !== itemIndex);
      updated[catIndex] = { ...updated[catIndex], items };
      formik.setFieldValue("menu", updated);
    }
  };

  const handleSaveItem = () => {
    if (!editingItem) return;
    if (!editingItem.name.trim()) {
      toast.error("Item Name is required.");
      return;
    }
    const updated = [...formik.values.menu];
    const category = updated[editingItem.catIndex];
    const items = [...category.items];

    const itemData: any = {
      name: editingItem.name.trim(),
      price: editingItem.price !== "" ? Number(editingItem.price) : "",
      description: editingItem.description.trim(),
      image: editingItem.image,
      featured: editingItem.featured,
      isNew: editingItem.isNew,
      diet: editingItem.diet || null,
      stock: editingItem.trackStock && editingItem.stock !== "" ? Number(editingItem.stock) : null,
      serviceDetails: editingItem.isService ? {
        isService: true,
        duration: Number(editingItem.serviceDuration) || 30
      } : null,
      highlights: editingItem.highlights,
      highlightsLabel: editingItem.highlightsLabel.trim() || "Highlights",
    };

    if (editingItem.itemIndex === null) {
      // Create new item
      items.push(itemData);
    } else {
      // Edit existing item
      items[editingItem.itemIndex] = itemData;
    }

    updated[editingItem.catIndex] = { ...category, items };
    formik.setFieldValue("menu", updated);
    setEditingItem(null);
  };

  const tabs = [
    {
      id: "identity",
      label: "General Identity",
      icon: IdentificationIcon,
      hasError: Boolean(
        formik.errors.name || formik.errors.slug || formik.errors.category,
      ),
    },
    {
      id: "location",
      label: "Location & Address",
      icon: MapPinIcon,
      hasError: Boolean(formik.errors.city || formik.errors.area),
    },
    {
      id: "contact",
      label: "Contact & Config",
      icon: PhoneIcon,
      hasError: Boolean(formik.errors.phone || formik.errors.ownerEmail),
    },
    { id: "social", label: "Social & Web", icon: ShareIcon, hasError: false },
    {
      id: "hours",
      label: "Hours & Holidays",
      icon: ClockIcon,
      hasError: false,
    },
    { id: "saas", label: "SaaS Features", icon: SparklesIcon, hasError: false },
    {
      id: "catalog",
      label: "Catalog & Menu",
      icon: ShoppingBagIcon,
      hasError: false,
    },
  ];

  useEffect(() => {
    if (formik.submitCount > 0 && Object.keys(formik.errors).length > 0) {
      if (formik.errors.name || formik.errors.slug || formik.errors.category) {
        setActiveTab("identity");
      } else if (formik.errors.city || formik.errors.area) {
        setActiveTab("location");
      } else if (formik.errors.phone || formik.errors.ownerEmail) {
        setActiveTab("contact");
      }
    }
  }, [formik.submitCount, formik.errors]);

  return (
    <div className="max-w-5xl mx-auto space-y-3 pb-16">
      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          onClick={() => navigate("/shops")}
          className="!p-1.5"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Shop Master Profile" : "Shop Master Form"}
          </h1>
          <p className="text-gray-500 text-[11px]">
            {isEdit
              ? "Update comprehensive shop configuration and settings."
              : "Create a new comprehensive shop profile."}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-md border border-gray-200/60 overflow-x-auto shadow-2xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all shrink-0 relative ${isActive
                ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50/80"
                }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-primary-600" : "text-gray-400"}`}
              />
              {tab.label}
              {tab.hasError && (
                <span
                  className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 animate-pulse"
                  title="Validation Error"
                />
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-3">
        {/* Identity Section */}
        {activeTab === "identity" && (
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <IdentificationIcon className="w-4 h-4 text-primary-600" />
              <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                Shop Identity
              </h2>
            </div>
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-3">
                  <FormInputField
                    label="Shop Name"
                    name="name"
                    placeholder="e.g. Sharma Premium Groceries"
                    value={formik.values.name}
                    onChange={handleNameChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.name && formik.errors.name
                        ? formik.errors.name
                        : ""
                    }
                    required
                  />
                  <FormInputField
                    label="URL Slug"
                    name="slug"
                    placeholder="shop-slug-name"
                    value={formik.values.slug}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                      setIsSlugCustom(val !== "");
                      formik.setFieldValue("slug", val);
                    }}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.slug && formik.errors.slug
                        ? formik.errors.slug
                        : slugStatus === "taken"
                        ? "This shop URL is already taken"
                        : slugStatus === "invalid"
                        ? "Only lowercase letters, numbers, and hyphens allowed"
                        : ""
                    }
                    helperText={
                      slugStatus === "checking"
                        ? "Checking availability..."
                        : slugStatus === "available"
                        ? "✓ URL is available"
                        : undefined
                    }
                    required
                  />
                </div>
                <div className="space-y-3">
                  <FormSelectField
                    label="Category"
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    options={[
                      { value: "", label: "Select Category" },
                      ...categories.map((c) => ({
                        value: c.name,
                        label: c.name,
                      })),
                    ]}
                    error={
                      formik.touched.category && formik.errors.category
                        ? formik.errors.category
                        : ""
                    }
                    required
                  />
                  <FormSelectField
                    label="Service Model"
                    name="businessType"
                    value={formik.values.businessType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    options={[
                      { value: "product", label: "Product Based" },
                      { value: "service", label: "Service Based" },
                      { value: "mixed", label: "Hybrid" },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ImageUpload
                  label="Store Logo"
                  value={formik.values.logo}
                  onChange={(url) => formik.setFieldValue("logo", url)}
                  folder="shops/logos"
                />
                <ImageUpload
                  label="Cover Image"
                  value={formik.values.coverImage}
                  onChange={(url) => formik.setFieldValue("coverImage", url)}
                  folder="shops/covers"
                />
              </div>

              <FormTextareaField
                label="Store Description"
                name="description"
                rows={2}
                placeholder="Tell customers about your business..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>
        )}

        {/* Location Section */}
        {activeTab === "location" && (
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                Location & Address
              </h2>
            </div>
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormInputField
                  label="Shop No"
                  name="shopNo"
                  placeholder="e.g. G-12"
                  value={formik.values.shopNo}
                  onChange={formik.handleChange}
                />
                <FormInputField
                  label="Building / Complex"
                  name="building"
                  placeholder="e.g. City Plaza"
                  value={formik.values.building}
                  onChange={formik.handleChange}
                />
                <FormInputField
                  label="Landmark / Zone"
                  name="zone"
                  placeholder="e.g. Near Station"
                  value={formik.values.zone}
                  onChange={formik.handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <FormSelectField
                  label="Country"
                  name="country"
                  value={formik.values.country}
                  onChange={handleCountryChange}
                  onBlur={formik.handleBlur}
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
                  onBlur={formik.handleBlur}
                  options={[
                    { value: "", label: "Select State" },
                    ...stateOptions,
                  ]}
                  error={
                    formik.touched.state && formik.errors.state
                      ? formik.errors.state
                      : ""
                  }
                />
                <FormSelectField
                  label="City"
                  name="city"
                  value={formik.values.city}
                  onChange={handleCityChange}
                  onBlur={formik.handleBlur}
                  options={[
                    { value: "", label: "Select City" },
                    ...cityOptions,
                  ]}
                  error={
                    formik.touched.city && formik.errors.city
                      ? formik.errors.city
                      : ""
                  }
                  required
                />
                <FormSelectField
                  label="Area / Locality"
                  name="area"
                  value={formik.values.area}
                  onChange={handleAreaChange}
                  onBlur={formik.handleBlur}
                  options={[
                    { value: "", label: "Select Area" },
                    ...areaOptions,
                  ]}
                  error={
                    formik.touched.area && formik.errors.area
                      ? formik.errors.area
                      : ""
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormInputField
                  label="Village (Optional)"
                  name="village"
                  placeholder="e.g. Sukanta Nagar"
                  value={formik.values.village}
                  onChange={formik.handleChange}
                />
                <FormInputField
                  label="Pincode"
                  name="pincode"
                  placeholder="e.g. 700091"
                  value={formik.values.pincode}
                  onChange={formik.handleChange}
                />
                <FormSelectField
                  label="Market Area / Cluster"
                  name="clusterType"
                  value={formik.values.clusterType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  options={[
                    { value: "", label: "Select Cluster" },
                    ...clusterOptions,
                  ]}
                  error={
                    formik.touched.clusterType && formik.errors.clusterType
                      ? formik.errors.clusterType
                      : ""
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormInputField
                  label="Latitude"
                  name="lat"
                  placeholder="e.g. 22.5726"
                  value={formik.values.lat}
                  onChange={formik.handleChange}
                />
                <FormInputField
                  label="Longitude"
                  name="lng"
                  placeholder="e.g. 88.3639"
                  value={formik.values.lng}
                  onChange={formik.handleChange}
                />
                <FormInputField
                  label="Map Embed URL (src)"
                  name="mapEmbed"
                  placeholder="https://google.com/maps/embed/..."
                  value={formik.values.mapEmbed}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact & Config Section */}
        {activeTab === "contact" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-green-600" />
                  <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                    Contact Details
                  </h2>
                </div>
                <div className="p-3 space-y-3">
                  <FormInputField
                    label="WhatsApp Business Number"
                    name="phone"
                    placeholder="e.g. 9876543210"
                    value={formik.values.phone}
                    onChange={handlePhoneChange}
                    onBlur={formik.handleBlur}
                    prefix={getCountryCode(formik.values.country)}
                    error={
                      formik.touched.phone && formik.errors.phone
                        ? formik.errors.phone
                        : ""
                    }
                    required
                  />
                  <FormInputField
                    label="Owner Email (Optional)"
                    name="ownerEmail"
                    type="email"
                    placeholder="owner@example.com"
                    value={formik.values.ownerEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.ownerEmail && formik.errors.ownerEmail
                        ? formik.errors.ownerEmail
                        : ""
                    }
                  />
                </div>
              </div>

              <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                  <SwatchIcon className="w-4 h-4 text-purple-600" />
                  <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                    Design & Rating
                  </h2>
                </div>
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormInputField
                      label="Primary Color"
                      name="primaryColor"
                      type="color"
                      value={formik.values.primaryColor}
                      onChange={formik.handleChange}
                    />
                    <FormInputField
                      label="Secondary Color"
                      name="secondaryColor"
                      type="color"
                      value={formik.values.secondaryColor}
                      onChange={formik.handleChange}
                    />
                  </div>
                   <div className="grid grid-cols-3 gap-3">
                    <FormInputField
                      label="Rating"
                      name="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
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
                    <FormSelectField
                      label="Verified"
                      name="isVerified"
                      value={String(formik.values.isVerified)}
                      onChange={(e) => formik.setFieldValue("isVerified", e.target.value === "true")}
                      options={[
                        { value: "true", label: "Yes" },
                        { value: "false", label: "No" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery & Logistics Settings */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
              <div className="px-3.5 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                <TruckIcon className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                  Delivery & Logistics Settings
                </h2>
              </div>
              <div className="p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-4 flex items-center justify-between p-2.5 bg-gray-50 rounded-md border border-gray-200/60">
                  <div>
                    <div className="font-bold text-xs text-gray-900">Delivery Available</div>
                    <div className="text-[10px] text-gray-500">Enable home delivery for this shop</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasDelivery"
                      checked={formik.values.hasDelivery}
                      onChange={formik.handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="md:col-span-8">
                  <FormInputField
                    label="Delivery Message / Conditions"
                    name="deliveryMessage"
                    placeholder="e.g. Free delivery on orders above ₹300 | 30-45 mins"
                    value={formik.values.deliveryMessage}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!formik.values.hasDelivery}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social & Web Presence Section */}
        {activeTab === "social" && (
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <ShareIcon className="w-4 h-4 text-pink-600" />
              <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                Social Media & Web Presence
              </h2>
            </div>
            <div className="p-3 space-y-2.5">
              {formik.values.socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-md border border-gray-200/60"
                >
                  <div className="w-36 shrink-0">
                    <select
                      value={link.platform}
                      onChange={(e) =>
                        handleSocialLinkChange(
                          index,
                          "platform",
                          e.target.value,
                        )
                      }
                      className="w-full h-8 px-2 bg-white border border-gray-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-primary-500 focus:outline-none cursor-pointer"
                    >
                      {socialPlatforms.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="https://instagram.com/yourshop"
                      value={link.url}
                      onChange={(e) =>
                        handleSocialLinkChange(index, "url", e.target.value)
                      }
                      className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => handleRemoveSocialLink(index)}
                    className="!p-1 text-red-500 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddSocialLink}
                className="w-full py-2 px-4 border border-dashed border-gray-200 hover:border-primary-500/40 rounded-md flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary-600 transition-all bg-transparent hover:bg-primary-50/50"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add Social Media Link
              </button>
            </div>
          </div>
        )}

        {/* Operating Hours & Holidays Section */}
        {activeTab === "hours" && (
          <div className="space-y-3">
            <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                  Operating Hours
                </h2>
              </div>
              <div className="p-3 space-y-2.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {DAYS.map((day) => {
                    const dayData = formik.values.openingHoursDetails[day] || {
                      isClosed: false,
                      open: "09:00",
                      close: "21:00",
                    };
                    return (
                      <div
                        key={day}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200/60 gap-2"
                      >
                        <div className="w-24 font-bold text-xs capitalize text-gray-700">
                          {day}
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!dayData.isClosed}
                              onChange={(e) =>
                                handleOpeningHoursChange(
                                  day,
                                  "isClosed",
                                  !e.target.checked,
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                          <span className="text-[11px] font-semibold text-gray-500 w-12 text-center">
                            {dayData.isClosed ? "Closed" : "Open"}
                          </span>
                          {!dayData.isClosed && (
                            <div className="flex items-center gap-1">
                              <input
                                type="time"
                                value={dayData.open}
                                onChange={(e) =>
                                  handleOpeningHoursChange(
                                    day,
                                    "open",
                                    e.target.value,
                                  )
                                }
                                className="h-7 px-1 bg-white border border-gray-300 rounded text-xs font-semibold focus:ring-1 focus:ring-primary-500 focus:outline-none"
                              />
                              <span className="text-gray-400 text-[11px]">
                                to
                              </span>
                              <input
                                type="time"
                                value={dayData.close}
                                onChange={(e) =>
                                  handleOpeningHoursChange(
                                    day,
                                    "close",
                                    e.target.value,
                                  )
                                }
                                className="h-7 px-1 bg-white border border-gray-300 rounded text-xs font-semibold focus:ring-1 focus:ring-primary-500 focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-600" />
                <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                  Holidays & Special Closures
                </h2>
              </div>
              <div className="p-3 space-y-2.5">
                {formik.values.holidays.map((holiday, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-md border border-gray-200/60"
                  >
                    <div className="w-36 shrink-0">
                      <input
                        type="date"
                        value={holiday.date}
                        onChange={(e) =>
                          handleHolidayChange(index, "date", e.target.value)
                        }
                        className="w-full h-8 px-2 bg-white border border-gray-300 rounded-md text-xs font-semibold focus:ring-1 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Holiday Name (e.g. Diwali, Christmas)"
                        value={holiday.name}
                        onChange={(e) =>
                          handleHolidayChange(index, "name", e.target.value)
                        }
                        className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => handleRemoveHoliday(index)}
                      className="!p-1 text-red-50 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddHoliday}
                  className="w-full py-2 px-4 border border-dashed border-gray-200 hover:border-primary-500/40 rounded-md flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary-600 transition-all bg-transparent hover:bg-primary-50/50"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Add Holiday / Closure Date
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Features Section */}
        {activeTab === "saas" && (
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-[#FF6A00]" />
              <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                SaaS Marketplace Entitlements
              </h2>
            </div>
            <div className="p-3">
              {features.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 font-medium">
                  No master features configured in the SaaS Features Master
                  console yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {features.map((feature) => {
                    const activeData =
                      formik.values.paidFeatures[feature.featureKey];
                    const isActive = !!activeData;

                    return (
                      <div
                        key={feature.id}
                        className={`p-3 rounded-md border transition-all flex flex-col justify-between gap-2.5 ${isActive
                          ? "bg-white border-primary-500/40 shadow-sm ring-1 ring-primary-500/10"
                          : "bg-gray-50/50 border-gray-200 opacity-75 hover:opacity-100"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-gray-900">
                              {feature.title}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                              {feature.description}
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() =>
                                handleTogglePaidFeature(
                                  feature.featureKey,
                                  feature.billingCycle,
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>

                        {isActive && (
                          <div className="pt-2.5 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] text-gray-400 block font-bold mb-0.5">
                                Status
                              </label>
                              <select
                                value={activeData.status}
                                onChange={(e) =>
                                  handlePaidFeatureFieldChange(
                                    feature.featureKey,
                                    "status",
                                    e.target.value,
                                  )
                                }
                                className="w-full h-7 px-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:ring-1 focus:ring-primary-500 focus:outline-none"
                              >
                                <option value="active">Active</option>
                                <option value="trial">Trial</option>
                                <option value="suspended">Suspended</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block font-bold mb-0.5">
                                Billing
                              </label>
                              <select
                                value={activeData.billingCycle}
                                onChange={(e) =>
                                  handlePaidFeatureFieldChange(
                                    feature.featureKey,
                                    "billingCycle",
                                    e.target.value,
                                  )
                                }
                                className="w-full h-7 px-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:ring-1 focus:ring-primary-500 focus:outline-none capitalize"
                              >
                                <option value="monthly">Monthly</option>
                                <option value="annual">Annual</option>
                                <option value="one-time">Lifetime</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Catalog Management Section */}
        {activeTab === "catalog" && (
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShoppingBagIcon className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                  Catalog & Menu Management
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddMenuCategory}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md flex items-center gap-1 transition-all border border-emerald-200 shadow-2xs"
              >
                <PlusIcon className="w-3 h-3" />
                Add Category
              </button>
            </div>
            <div className="p-3 space-y-4">
              {formik.values.menu.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-md">
                  No catalog categories configured. Click "Add Category" above
                  to start building the menu.
                </div>
              ) : (
                formik.values.menu.map((category, catIndex) => (
                  <div
                    key={catIndex}
                    className="bg-gray-50/50 border border-gray-200/80 rounded-md p-3 space-y-3"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-gray-200/60">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
                          Category
                        </span>
                        <input
                          type="text"
                          placeholder="Category Name (e.g., Starters, Main Course, Services)"
                          value={category.name}
                          onChange={(e) =>
                            handleMenuCategoryNameChange(
                              catIndex,
                              e.target.value,
                            )
                          }
                          className="h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs font-bold text-gray-800 focus:ring-1 focus:ring-primary-500 focus:outline-none max-w-md w-full"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddMenuItem(catIndex)}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-md flex items-center gap-1 transition-all border border-gray-300 shadow-2xs"
                        >
                          <PlusIcon className="w-3 h-3 text-primary-600" />
                          Add Item
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveMenuCategory(catIndex)}
                          className="p-1 bg-white hover:bg-red-50 text-red-500 rounded-md transition-all border border-gray-300 hover:border-red-200 shadow-2xs"
                          title="Delete Category"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                      {category.items.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-405 italic bg-white rounded-md border border-gray-200/60">
                          No items in this category. Click "Add Item" to add
                          products or services.
                        </div>
                      ) : (
                        <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-2xs">
                          <table className="min-w-full divide-y divide-gray-200 text-left">
                            <thead className="bg-gray-50/70">
                              <tr>
                                <th scope="col" className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-16">
                                  Preview
                                </th>
                                <th scope="col" className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                  Item Details
                                </th>
                                <th scope="col" className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-24">
                                  Price
                                </th>
                                <th scope="col" className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-24">
                                  Stock
                                </th>
                                <th scope="col" className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-24 text-right">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-150 bg-white">
                              {category.items.map((item, itemIndex) => {
                                const isVideo = item.image && isVideoUrl(item.image);
                                const hasStock = item.stock !== undefined && item.stock !== null && item.stock !== "";
                                const isServ = !!item.serviceDetails?.isService;

                                return (
                                  <tr key={itemIndex} className="hover:bg-gray-50/30 transition-colors">
                                    {/* Preview Thumbnail */}
                                    <td className="px-3 py-2 shrink-0">
                                      <div className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 relative">
                                        {item.image ? (
                                          isVideo ? (
                                            <video src={item.image} className="w-full h-full object-cover" muted />
                                          ) : (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                          )
                                        ) : (
                                          <ShoppingBagIcon className="w-4 h-4 text-gray-305" />
                                        )}
                                      </div>
                                    </td>
                                    {/* Name, Description, Badges */}
                                    <td className="px-3 py-2">
                                      <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-xs font-bold text-gray-800">{item.name || "Unnamed Item"}</span>
                                          {item.diet === "veg" && (
                                            <span className="px-1.5 py-0.2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold rounded">
                                              Veg 🟢
                                            </span>
                                          )}
                                          {item.diet === "nonveg" && (
                                            <span className="px-1.5 py-0.2 bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-bold rounded">
                                              Non-Veg 🔴
                                            </span>
                                          )}
                                          {isServ && (
                                            <span className="px-1.5 py-0.2 bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-bold rounded">
                                              Service ({item.serviceDetails?.duration || 30}m)
                                            </span>
                                          )}
                                          {item.featured && (
                                            <span className="px-1.5 py-0.2 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold rounded">
                                              Featured ⭐
                                            </span>
                                          )}
                                          {item.isNew !== false && (
                                            <span className="px-1.5 py-0.2 bg-purple-50 border border-purple-200 text-purple-700 text-[9px] font-bold rounded">
                                              New ✨
                                            </span>
                                          )}
                                        </div>
                                        {item.description && (
                                          <p className="text-[10px] text-gray-500 line-clamp-1 max-w-sm">
                                            {item.description}
                                          </p>
                                        )}
                                        {item.highlights && item.highlights.length > 0 && (
                                          <p className="text-[9px] text-gray-400 font-medium italic mt-0.5">
                                            {item.highlights.length} bullet points ({item.highlightsLabel || "Highlights"})
                                          </p>
                                        )}
                                      </div>
                                    </td>
                                    {/* Price */}
                                    <td className="px-3 py-2 text-xs font-bold text-primary-600">
                                      {item.price ? `₹${item.price}` : "—"}
                                    </td>
                                    {/* Stock */}
                                    <td className="px-3 py-2 text-xs font-medium text-gray-600">
                                      {hasStock ? `${item.stock} units` : <span className="text-gray-400">Unlimited</span>}
                                    </td>
                                    {/* Action Buttons */}
                                    <td className="px-3 py-2 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleEditMenuItem(catIndex, itemIndex)}
                                          className="p-1 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded transition-all border border-transparent hover:border-gray-200 shadow-3xs cursor-pointer"
                                          title="Edit Item"
                                        >
                                          <PencilIcon className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveMenuItem(catIndex, itemIndex)}
                                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-all border border-transparent hover:border-red-100 shadow-3xs cursor-pointer"
                                          title="Delete Item"
                                        >
                                          <TrashIcon className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate("/shops")}
            className="!px-6 !py-1.5 text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={formik.isSubmitting}
            className="!px-8 !py-1.5 text-xs font-bold"
          >
            {isEdit ? "Update Shop Profile" : "Create Shop Master Profile"}
          </Button>
        </div>
      </form>

      {/* Catalog Item Slide-Over Drawer */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-300 ease-out" 
            onClick={() => setEditingItem(null)} 
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-gray-150">
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wider">
                    {editingItem.itemIndex === null ? "Add Catalog Item" : "Edit Catalog Item"}
                  </h3>
                  <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                    Category: {formik.values.menu[editingItem.catIndex]?.name || `Category ${editingItem.catIndex + 1}`}
                  </span>
                </div>
                <button
                  type="button"
                  className="rounded-md p-1.5 text-gray-400 hover:text-gray-650 hover:bg-gray-100 transition-all focus:outline-none"
                  onClick={() => setEditingItem(null)}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Image/Video Upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Item Image / Video
                  </label>
                  <ImageUpload
                    value={editingItem.image}
                    onChange={(url: string) => setEditingItem({ ...editingItem, image: url })}
                    folder="shops/catalog"
                    beforeUpload={async (file: File) => {
                      if (file.type.startsWith("video/")) {
                        const originalImage = editingItem.image;
                        const originalIsVideo = originalImage && isVideoUrl(originalImage);
                        const videoCount = countCatalogVideos(formik.values.menu);
                        if (videoCount >= 5 && !originalIsVideo) {
                          toast.error("Maximum 5 videos allowed per shop catalog.");
                          return false;
                        }
                      }
                      return true;
                    }}
                  />
                </div>

                {/* Item Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Organic Avocados"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs font-semibold focus:ring-1 focus:ring-primary-500 focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                    className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs font-semibold focus:ring-1 focus:ring-primary-500 focus:outline-none focus:border-primary-500 font-bold text-primary-600"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Description
                  </label>
                  <textarea
                    placeholder="e.g. Fresh organically grown Hass avocados..."
                    rows={3}
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-primary-500 focus:outline-none focus:border-primary-500 leading-normal"
                  />
                </div>

                {/* Diet Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Diet Type
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-md border border-gray-200">
                    {[
                      { value: "", label: "None" },
                      { value: "veg", label: "Veg 🟢" },
                      { value: "nonveg", label: "Non-Veg 🔴" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, diet: opt.value })}
                        className={`py-1.5 text-center rounded text-xs font-bold transition-all ${
                          editingItem.diet === opt.value
                            ? "bg-white text-gray-900 shadow-xs border border-gray-200/50"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured & New */}
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingItem.featured}
                      onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-50 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-700">Featured Item ⭐</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingItem.isNew}
                      onChange={(e) => setEditingItem({ ...editingItem, isNew: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-50 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-700">Mark as New ✨</span>
                  </label>
                </div>

                {/* Stock Tracking */}
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200/60 space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingItem.trackStock}
                      onChange={(e) => setEditingItem({ 
                        ...editingItem, 
                        trackStock: e.target.checked, 
                        stock: e.target.checked ? (editingItem.stock || "0") : "" 
                      })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-50 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-805">Track Catalog Inventory</span>
                  </label>
                  {editingItem.trackStock && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Available Quantity
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={editingItem.stock}
                        onChange={(e) => setEditingItem({ ...editingItem, stock: e.target.value })}
                        className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs font-semibold focus:ring-1 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Service Details */}
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200/60 space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingItem.isService}
                      onChange={(e) => setEditingItem({ ...editingItem, isService: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-50 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-805">This item is a Service</span>
                  </label>
                  {editingItem.isService && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 30"
                        value={editingItem.serviceDuration}
                        onChange={(e) => setEditingItem({ ...editingItem, serviceDuration: e.target.value })}
                        className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs font-semibold focus:ring-1 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Highlights Section */}
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200/60 space-y-2.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Bullet Points Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Highlights, Specs, Features"
                      value={editingItem.highlightsLabel}
                      onChange={(e) => setEditingItem({ ...editingItem, highlightsLabel: e.target.value })}
                      className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs font-semibold focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Add Bullet Points / Specifications
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Pure leather, 1 year warranty"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        className="flex-1 h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-primary-500 focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newHighlight.trim()) {
                              setEditingItem({
                                ...editingItem,
                                highlights: [...editingItem.highlights, newHighlight.trim()]
                              });
                              setNewHighlight("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newHighlight.trim()) {
                            setEditingItem({
                              ...editingItem,
                              highlights: [...editingItem.highlights, newHighlight.trim()]
                            });
                            setNewHighlight("");
                          }
                        }}
                        className="px-3 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-all shrink-0"
                      >
                        Add
                      </button>
                    </div>

                    {editingItem.highlights.length > 0 && (
                      <ul className="space-y-1.5 pt-1.5">
                        {editingItem.highlights.map((hl, idx) => (
                          <li key={idx} className="flex items-center justify-between gap-2 p-1.5 bg-white rounded border border-gray-200 text-xs">
                            <span className="text-gray-700 truncate font-medium">• {hl}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem({
                                  ...editingItem,
                                  highlights: editingItem.highlights.filter((_, i) => i !== idx)
                                });
                              }}
                              className="text-red-500 hover:text-red-650 hover:bg-red-50 p-1 rounded transition-all shrink-0"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0">
                <button
                  type="button"
                  className="flex-1 py-1.5 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 transition-all cursor-pointer"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer"
                  onClick={handleSaveItem}
                >
                  Save Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
