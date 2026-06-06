import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchLogs } from "./logSlice";
import { DataTable, type Column } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { UserIcon, ClockIcon } from "@heroicons/react/24/outline";

export const LogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { logs, isLoading } = useAppSelector((state) => state.logs);

  useEffect(() => {
    dispatch(fetchLogs());
  }, [dispatch]);

  const columns: Column<any>[] = [
    {
      key: "action",
      header: "Action",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              row.action.includes("APPROVE")
                ? "success"
                : row.action.includes("REJECT")
                  ? "danger"
                  : "default"
            }
          >
            {row.action.replace("_", " ")}
          </Badge>
        </div>
      ),
    },
    {
      key: "details",
      header: "Activity Details",
      render: (row) => (
        <div className="text-sm text-gray-700 font-medium">{row.details}</div>
      ),
    },
    {
      key: "performedBy",
      header: "Operator",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <UserIcon className="w-3.5 h-3.5" />
          {row.performedBy}
        </div>
      ),
    },
    {
      key: "timestamp",
      header: "Timestamp",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <ClockIcon className="w-3.5 h-3.5" />
          {new Date(row.timestamp).toLocaleString()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Ledger</h1>
        <p className="text-gray-500 text-sm">
          Immutable audit trail of all administrative actions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={isLoading}
        searchKey="details"
        searchPlaceholder="Search audit trail..."
      />
    </div>
  );
};
