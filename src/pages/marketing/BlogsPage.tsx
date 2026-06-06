import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchBlogs, deleteBlogAction } from "./blogSlice";
import { DataTable, type Column } from "../../components/table/DataTable";
import { Badge } from "../../components/common/Badge";
import {
  AddIconButton,
  EditIconButton,
  DeleteIconButton,
} from "../../components/common/common";
import { openDialog } from "../../store/dialogSlice";
import { DeleteDialog } from "../../components/dialog/DeleteDialog";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

import { useNavigate } from "react-router-dom";

export const BlogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { blogs, isLoading } = useAppSelector((state) => state.blogs);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleEdit = (row: any) => {
    navigate(`/marketing/blogs/edit/${row.id}`);
  };

  const handleAdd = () => {
    navigate("/marketing/blogs/add");
  };

  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Article Info",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border border-gray-100">
            {row.coverImage ? (
              <img src={row.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <DocumentTextIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{row.title}</span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">
              /{row.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      filterable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <Badge variant={value === "published" ? "success" : "warning"}>
          {value || "draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <EditIconButton onClick={() => handleEdit(row)} />
          <DeleteIconButton
            onClick={() =>
              dispatch(
                openDialog({
                  id: row.id,
                  dialogName: "confirmblogdelete",
                  name: row.title,
                  type: "blog",
                }),
              )
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-500 text-sm">
            Publish and manage platform editorial content.
          </p>
        </div>
        <AddIconButton onClick={handleAdd} label="New Article" />
      </div>

      <DataTable
        title="Editorial List"
        columns={columns}
        data={blogs}
        isLoading={isLoading}
        onRefresh={() => dispatch(fetchBlogs())}
        searchPlaceholder="Search articles..."
      />

      <DeleteDialog
        itemType="blog"
        onConfirm={async (id) => {
          await dispatch(deleteBlogAction(id));
        }}
      />
    </div>
  );
};
