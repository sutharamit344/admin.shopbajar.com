import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createBlogAction, updateBlogAction, fetchBlogs } from "./blogSlice";
import { FormInputField } from "../../components/formFields/FormInputField";
import { FormSelectField } from "../../components/formFields/FormSelectField";
import { FormTextareaField } from "../../components/formFields/FormTextareaField";
import { ImageUpload } from "../../components/common/ImageUpload";
import { Button } from "../../components/common/Button";
import { useParams, useNavigate } from "react-router-dom";
import {
  DocumentTextIcon,
  PhotoIcon,
  ChevronLeftIcon,
  EyeIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  category: Yup.string().required("Category is required"),
  content: Yup.string().required("Content is required"),
  status: Yup.string().oneOf(["draft", "published"]).required("Status is required"),
});

export const BlogFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      title: "",
      category: "",
      content: "",
      excerpt: "",
      author: "",
      coverImage: "",
      status: "draft",
    },
    validationSchema,
    onSubmit: async (values) => {
      const blogData = values as any;
      if (id) {
        await dispatch(updateBlogAction({ id, data: blogData }));
      } else {
        await dispatch(createBlogAction(blogData));
      }
      navigate("/marketing/blogs");
    },
  });

  const { blogs } = useAppSelector((state) => state.blogs);

  useEffect(() => {
    if (id) {
      const blog = blogs.find((b) => b.id === id);
      if (blog) {
        formik.setValues({
          title: blog.title || "",
          category: blog.category || "",
          content: blog.content || "",
          excerpt: blog.excerpt || "",
          author: blog.author || "",
          coverImage: blog.coverImage || "",
          status: (blog as any).status || "draft",
        });
      } else {
        // If not in state, fetch all blogs (simplest fix for now)
        dispatch(fetchBlogs());
      }
    }
  }, [id, blogs]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/marketing/blogs")}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-500"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {id ? "Edit Article" : "Create New Article"}
            </h1>
            <p className="text-sm text-gray-500">
              {id ? "Update your published content" : "Draft a new editorial piece"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" onClick={() => navigate("/marketing/blogs")}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => formik.handleSubmit()}
            isLoading={formik.isSubmitting}
            leftIcon={<CloudArrowUpIcon className="w-5 h-5" />}
          >
            {id ? "Update & Sync" : "Publish Article"}
          </Button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-50 rounded-md flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900">Editor</h3>
            </div>

            <FormInputField
              label="Article Title"
              name="title"
              placeholder="Enter a catchy title..."
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && formik.errors.title ? formik.errors.title : ""}
              className="text-lg font-bold"
            />

            <FormTextareaField
              label="Short Excerpt"
              name="excerpt"
              placeholder="Summary for search results..."
              value={formik.values.excerpt}
              onChange={formik.handleChange}
              rows={3}
            />

            <FormTextareaField
              label="Full Content"
              name="content"
              placeholder="Start writing..."
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.content && formik.errors.content ? formik.errors.content : ""}
              rows={20}
            />
          </div>
        </div>

        {/* Sidebar / Settings */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-md flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900">Cover Media</h3>
            </div>

            <div className="aspect-video bg-gray-50 rounded-md overflow-hidden border-2 border-dashed border-gray-200">
              <ImageUpload
                value={formik.values.coverImage}
                onChange={(url) => formik.setFieldValue("coverImage", url)}
                className="w-full h-full"
                folder="blogs"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-md flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900">Publishing</h3>
            </div>

            <FormSelectField
              label="Status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
              ]}
            />

            <FormSelectField
              label="Category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              options={[
                { value: "", label: "Select Category" },
                { value: "Shopping", label: "Shopping" },
                { value: "Food", label: "Food & Dining" },
                { value: "Lifestyle", label: "Lifestyle" },
                { value: "Technology", label: "Technology" },
              ]}
              error={formik.touched.category && formik.errors.category ? formik.errors.category : ""}
            />

            <FormInputField
              label="Author"
              name="author"
              placeholder="Admin"
              value={formik.values.author}
              onChange={formik.handleChange}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
