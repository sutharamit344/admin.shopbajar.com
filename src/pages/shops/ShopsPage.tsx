// src/pages/shops/ShopsPage.tsx
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchAllShops,
  fetchInitialShopsIncremental,
  fetchMoreShopsIncremental,
  approveShopAction,
  rejectShopAction,
  deleteShopAction,
  bulkApproveShopsAction,
  createShopAction,
} from "./shopSlice";
import { DataTable, type Column } from "../../components/table/DataTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import {
  EditIconButton,
  DeleteIconButton,
  AddIconButton,
  CheckIconButton,
  CloseIconButton,
} from "../../components/common/common";
import { openDialog } from "../../store/dialogSlice";
import { useNavigate } from "react-router-dom";
import { DeleteDialog } from "../../components/dialog/DeleteDialog";
import { PhoneIcon } from "@heroicons/react/24/outline";

export const ShopsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { shops, pendingShops, isLoading, hasMore, isLoadingMore, totalCount } = useAppSelector(
    (state) => state.shops,
  );
  const [activeTab, setActiveTab] = useState<"approved" | "pending">(
    "approved",
  );
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  useEffect(() => {
    dispatch(fetchInitialShopsIncremental(25));
  }, [dispatch]);

  const handleApprove = (id: string) => {
    dispatch(approveShopAction(id));
  };

  const handleReject = (id: string) => {
    const reason = prompt("Reason for rejection:");
    if (reason) dispatch(rejectShopAction({ id, reason }));
  };

  const handleDelete = (id: string) => {
    dispatch(deleteShopAction(id));
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Shop Info",
      sortable: true,
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-500">{row.ownerEmail}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "Grocery", label: "Grocery" },
        { value: "Fashion", label: "Fashion" },
        { value: "Electronics", label: "Electronics" },
        { value: "Restaurant", label: "Restaurant" },
      ],
    },
    {
      key: "location",
      header: "Location",
      render: (_, row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-gray-700">{row.city}</span>
          <span className="text-gray-500">
            {row.area} {row.clusterType ? `(${row.clusterType})` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "WhatsApp",
      render: (value) => (
        <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
          <PhoneIcon className="w-3 h-3" />
          {value}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <Badge
          variant={
            value === "approved"
              ? "success"
              : value === "pending"
                ? "warning"
                : "danger"
          }
        >
          {value}
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
            <>
              <CheckIconButton
                onClick={() => handleApprove(row.id)}
                tooltip="Approve Shop"
              />
              <CloseIconButton
                onClick={() => handleReject(row.id)}
                tooltip="Reject Shop"
              />
            </>
          )}
          <EditIconButton
            onClick={() => navigate(`/shops/edit/${row.id}`)}
          />
          <DeleteIconButton
            onClick={() =>
              dispatch(
                openDialog({
                  id: row.id,
                  dialogName: "confirmshopdelete",
                  name: row.name,
                  type: "shop",
                }),
              )
            }
          />
        </div>
      ),
    },
  ];

  const bulkUploadConfig = {
    onUpload: async (data: any[]) => {
      // For each row, create a shop
      for (const row of data) {
        await dispatch(createShopAction({ ...row, status: "approved" }));
      }
    },
    template: [
      {
        key: "name",
        header: "Shop Name",
        required: true,
        example: "My Awesome Shop",
      },
      {
        key: "slug",
        header: "Slug",
        required: true,
        example: "my-awesome-shop",
      },
      {
        key: "category",
        header: "Category",
        required: true,
        example: "Grocery",
      },
      {
        key: "phone",
        header: "WhatsApp",
        required: true,
        example: "9876543210",
      },
      {
        key: "ownerEmail",
        header: "Owner Email",
        required: true,
        example: "owner@example.com",
      },
      { key: "city", header: "City", required: true, example: "Kolkata" },
      { key: "area", header: "Area", required: true, example: "Salt Lake" },
      { key: "clusterType", header: "Market Area", example: "IT Hub" },
    ],
    fileName: "ShopMaster",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Shop Management</h1>
          <p className="text-gray-500 text-xs">
            Standardized vendor management suite.
          </p>
        </div>
        <div className="flex gap-2">
          <AddIconButton
            onClick={() => navigate("/shops/add")}
            label="Add Shop"
            rounded={false}
            className="!rounded-md px-3 py-1.5 text-xs font-bold"
          />
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab("approved")}
          className={`pb-2.5 px-2 text-xs font-bold transition-all ${activeTab === "approved"
              ? "border-b-2 border-primary-800 text-primary-800"
              : "text-gray-400 hover:text-gray-600"
            }`}
        >
          Approved Shops ({activeTab === "approved" && totalCount !== undefined ? totalCount : shops.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-2.5 px-2 text-xs font-bold transition-all ${activeTab === "pending"
              ? "border-b-2 border-primary-800 text-primary-800"
              : "text-gray-400 hover:text-gray-600"
            }`}
        >
          Pending Review ({pendingShops.length})
        </button>
      </div>

      <DataTable
        columns={columns}
        data={activeTab === "approved" ? shops : pendingShops}
        isLoading={isLoading}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        title={`${activeTab === "approved" ? "Approved" : "Pending"} Shops`}
        bulkUpload={bulkUploadConfig}
        // Incremental Fetching Props (only active for approved tab)
        isIncremental={activeTab === "approved"}
        onLoadMore={() => {
          if (activeTab === "approved") {
            dispatch(fetchMoreShopsIncremental(25));
          }
        }}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        totalCount={activeTab === "approved" ? totalCount : pendingShops.length}
        incrementalMode="scroll"
        onRefresh={() => {
          if (activeTab === "approved") {
            dispatch(fetchInitialShopsIncremental(25));
          } else {
            dispatch(fetchAllShops());
          }
        }}
        bulkActions={(selectedItems) => (
          <div className="flex gap-2">
            {activeTab === "pending" && (
              <Button
                size="sm"
                variant="success"
                onClick={() => {
                  dispatch(
                    bulkApproveShopsAction(selectedItems.map((i) => i.id)),
                  );
                  setSelectedIds([]);
                }}
              >
                Approve Selected ({selectedItems.length})
              </Button>
            )}
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (
                  confirm(
                    `Are you sure you want to delete ${selectedItems.length} shops?`,
                  )
                ) {
                  selectedItems.forEach((item) =>
                    dispatch(deleteShopAction(item.id)),
                  );
                  setSelectedIds([]);
                }
              }}
            >
              Delete Selected
            </Button>
          </div>
        )}
      />

      <DeleteDialog
        itemType="shop"
        onConfirm={async (id) => {
          await handleDelete(id);
        }}
      />
    </div>
  );
};
