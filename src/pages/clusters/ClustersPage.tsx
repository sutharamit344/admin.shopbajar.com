import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchAllClusters,
  approveClusterAction,
  rejectClusterAction,
} from "./clusterSlice";
import { DataTable, type Column } from "../../components/table/DataTable";
import { Badge } from "../../components/common/Badge";
import {
  AddIconButton,
  EditIconButton,
  DeleteIconButton,
  CheckIconButton,
} from "../../components/common/common";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { opened } from "../../store/drawerSlice";
import { openDialog } from "../../store/dialogSlice";
import { DeleteDialog } from "../../components/dialog/DeleteDialog";

export const ClustersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusters, pendingClusters, isLoading } = useAppSelector(
    (state) => state.clusters,
  );
  const [activeTab, setActiveTab] = useState<"approved" | "pending">(
    "approved",
  );

  const loadData = () => {
    dispatch(fetchAllClusters());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleAdd = () => {
    dispatch(opened({ name: "Cluster", title: "Add New Cluster", data: null }));
  };

  const handleEdit = (row: any) => {
    dispatch(
      opened({
        name: "Cluster",
        title: `Edit Cluster: ${row.name}`,
        data: row,
      }),
    );
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Cluster Name",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-info-50 rounded-md text-info-600">
            <MapPinIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{value}</span>
            <span className="text-xs text-gray-500">{row.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (_, row) => (
        <div className="text-xs">
          {row.city}, {row.area} ({row.pincode})
        </div>
      ),
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
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === "pending" && (
            <CheckIconButton
              onClick={() => dispatch(approveClusterAction(row.id))}
              tooltip="Approve"
            />
          )}
          <EditIconButton onClick={() => handleEdit(row)} />
          <DeleteIconButton
            onClick={() =>
              dispatch(
                openDialog({
                  id: row.id,
                  dialogName: "confirmclusterdelete",
                  name: row.name,
                  type: "cluster",
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
          <h1 className="text-2xl font-bold text-gray-900">Business Clusters</h1>
          <p className="text-gray-500 text-sm">
            Manage geo-fenced business hubs.
          </p>
        </div>
        <AddIconButton onClick={handleAdd} label="New Cluster" />
      </div>

      <div className="flex gap-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab("approved")}
          className={`pb-3 px-2 text-sm font-medium transition-all ${activeTab === "approved"
              ? "border-b-2 border-primary-800 text-primary-800"
              : "text-gray-400 hover:text-gray-600"
            }`}
        >
          Approved ({clusters.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-2 text-sm font-medium transition-all ${activeTab === "pending"
              ? "border-b-2 border-primary-800 text-primary-800"
              : "text-gray-400 hover:text-gray-600"
            }`}
        >
          Pending Review ({pendingClusters.length})
        </button>
      </div>

      <DataTable
        title={`${activeTab === "approved" ? "Approved" : "Pending"} Clusters`}
        columns={columns}
        data={activeTab === "approved" ? clusters : pendingClusters}
        isLoading={isLoading}
        onRefresh={loadData}
        searchPlaceholder="Search clusters..."
      />

      <DeleteDialog
        itemType="cluster"
        onConfirm={async (id) => {
          await dispatch(rejectClusterAction(id));
        }}
      />
    </div>
  );
};
