import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchAllFeatures,
  deleteFeatureAction,
  seedFeaturesAction,
} from "./featureSlice";
import { DataTable, type Column } from "../../components/table/DataTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import {
  AddIconButton,
  EditIconButton,
  DeleteIconButton,
} from "../../components/common/common";
import { opened } from "../../store/drawerSlice";
import { openDialog } from "../../store/dialogSlice";
import { DeleteDialog } from "../../components/dialog/DeleteDialog";
import { SparklesIcon } from "@heroicons/react/24/outline";

export const FeaturesMasterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { features, isLoading } = useAppSelector((state) => state.features);

  const loadData = () => {
    dispatch(fetchAllFeatures());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleAddFeature = () => {
    dispatch(opened({ name: "Feature", title: "Add Master Feature", data: null }));
  };

  const handleEdit = (row: any) => {
    dispatch(
      opened({
        name: "Feature",
        title: `Edit Feature: ${row.title}`,
        data: row,
      }),
    );
  };

  const handleSeedFeatures = () => {
    dispatch(seedFeaturesAction());
  };

  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Feature Title",
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-bold text-gray-900">{row.title}</div>
          <div className="text-xs text-gray-500 font-mono">{row.featureKey}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (value) => <Badge variant="info">{value}</Badge>,
    },
    {
      key: "price",
      header: "Pricing",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-gray-900">₹{row.price}</span>
          <span className="text-xs text-gray-500 uppercase">/{row.billingCycle}</span>
        </div>
      ),
    },
    {
      key: "trialDays",
      header: "Trial Period",
      render: (value) => (
        <span className="text-xs font-medium text-gray-600">
          {value ? `${value} Days` : "No Trial"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <Badge variant={value === "active" ? "success" : "warning"}>
          {value === "active" ? "Active" : "Legacy"}
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
                  dialogName: "confirmfeaturedelete",
                  name: row.title,
                  type: "feature",
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SaaS Features Master</h1>
          <p className="text-gray-500 text-sm">
            Configure premium SaaS add-ons, pricing tiers, and trial periods for merchants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSeedFeatures}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            <SparklesIcon className="w-4 h-4 text-amber-500" />
            Seed Default Add-ons
          </Button>
          <AddIconButton onClick={handleAddFeature} label="Add Feature" />
        </div>
      </div>

      <DataTable
        title="Configured SaaS Features"
        columns={columns}
        data={features}
        isLoading={isLoading}
        onRefresh={loadData}
        searchPlaceholder="Search features by title, key, or category..."
      />

      <DeleteDialog
        itemType="feature"
        onConfirm={async (id) => {
          await dispatch(deleteFeatureAction(id));
        }}
      />
    </div>
  );
};
