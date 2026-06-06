import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchSubCategories, deleteSubCategoryAction } from "./subCategorySlice";
import { fetchAllCategories } from "./categorySlice";
import { DataTable, type Column } from "../../components/table/DataTable";
import {
  AddIconButton,
  EditIconButton,
  DeleteIconButton,
} from "../../components/common/common";
import { TagIcon } from "@heroicons/react/24/outline";

import { opened } from "../../store/drawerSlice";
import { openDialog } from "../../store/dialogSlice";
import { DeleteDialog } from "../../components/dialog/DeleteDialog";

export const SubCategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { subCategories, isLoading } = useAppSelector(
    (state) => state.subcategories,
  );

  const loadData = () => {
    dispatch(fetchSubCategories());
    dispatch(fetchAllCategories());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleAdd = () => {
    dispatch(opened({ name: "SubCategory", title: "Add New Subcategory", data: null }));
  };

  const handleEdit = (row: any) => {
    dispatch(
      opened({
        name: "SubCategory",
        title: `Edit Subcategory: ${row.name}`,
        data: row,
      }),
    );
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Subcategory",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-md text-gray-600">
            <TagIcon className="w-5 h-4" />
          </div>
          <span className="font-semibold text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: "parentCategory",
      header: "Parent Category",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-800" />
          <span className="text-sm font-medium text-gray-700">{value}</span>
        </div>
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
                  dialogName: "confirmsubcategorydelete",
                  name: row.name,
                  type: "subcategory",
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
          <h1 className="text-2xl font-bold text-gray-900">
            Sub Category Master
          </h1>
          <p className="text-gray-500 text-sm">
            Define specific niches within primary industries.
          </p>
        </div>
        <AddIconButton onClick={handleAdd} label="Add Subcategory" />
      </div>

      <DataTable
        title="Subcategories List"
        columns={columns}
        data={subCategories}
        isLoading={isLoading}
        onRefresh={loadData}
        searchPlaceholder="Search subcategories..."
      />

      <DeleteDialog
        itemType="subcategory"
        onConfirm={async (id) => {
          await dispatch(deleteSubCategoryAction(id));
        }}
      />
    </div>
  );
};
