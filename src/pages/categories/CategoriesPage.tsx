import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchAllCategories,
  approveCategoryAction,
  deleteCategoryAction,
} from "./categorySlice";
import { DataTable, type Column } from "../../components/table/DataTable";
import { Badge } from "../../components/common/Badge";
import {
  AddIconButton,
  EditIconButton,
  DeleteIconButton,
  CheckIconButton,
} from "../../components/common/common";

import { opened } from "../../store/drawerSlice";
import { openDialog } from "../../store/dialogSlice";
import { DeleteDialog } from "../../components/dialog/DeleteDialog";

export const CategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, pendingCategories, isLoading } = useAppSelector(
    (state) => state.categories,
  );
  const [activeTab, setActiveTab] = useState<"approved" | "pending">(
    "approved",
  );

  const loadData = () => {
    dispatch(fetchAllCategories());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleAddCategory = () => {
    dispatch(opened({ name: "Category", title: "Add New Category", data: null }));
  };

  const handleEdit = (row: any) => {
    dispatch(
      opened({
        name: "Category",
        title: `Edit Category: ${row.name}`,
        data: row,
      }),
    );
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Category Name",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <Badge variant={value === "approved" ? "success" : "warning"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "productViewType",
      header: "View Type",
      render: (value) => (
        <Badge variant="info">
          {value === "text" ? "Simple Text" : value === "mini" ? "Mini Card" : "Image Card"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === "pending" && (
            <CheckIconButton
              onClick={() => dispatch(approveCategoryAction(row.id))}
              tooltip="Approve"
            />
          )}
          <EditIconButton onClick={() => handleEdit(row)} />
          <DeleteIconButton
            onClick={() =>
              dispatch(
                openDialog({
                  id: row.id,
                  dialogName: "confirmcategorydelete",
                  name: row.name,
                  type: "category",
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
          <h1 className="text-2xl font-bold text-gray-900">Category Master</h1>
          <p className="text-gray-500 text-sm">
            Manage product and shop categories.
          </p>
        </div>
        <AddIconButton onClick={handleAddCategory} label="Add Category" />
      </div>

      <div className="flex gap-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab("approved")}
          className={`pb-3 px-2 text-sm font-medium transition-all ${
            activeTab === "approved"
              ? "border-b-2 border-primary-800 text-primary-800"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Approved ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-2 text-sm font-medium transition-all ${
            activeTab === "pending"
              ? "border-b-2 border-primary-800 text-primary-800"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Pending Review ({pendingCategories.length})
        </button>
      </div>

      <DataTable
        title={`${activeTab === "approved" ? "Approved" : "Pending"} Categories`}
        columns={columns}
        data={activeTab === "approved" ? categories : pendingCategories}
        isLoading={isLoading}
        onRefresh={loadData}
        searchPlaceholder="Search categories..."
      />

      <DeleteDialog
        itemType="category"
        onConfirm={async (id) => {
          await dispatch(deleteCategoryAction(id));
        }}
      />
    </div>
  );
};
