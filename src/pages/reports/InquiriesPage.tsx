import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchInquiries, toggleInquiryReadAction, deleteInquiryAction } from "./inquirySlice";
import { DataTable, type Column } from "../../components/common/DataTable";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import {
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export const InquiriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { inquiries, isLoading } = useAppSelector((state) => state.inquiries);
  const [filter, setFilter] = useState<"all" | "new" | "read">("all");

  useEffect(() => {
    dispatch(fetchInquiries());
  }, [dispatch]);

  const filteredData = inquiries.filter((m) => {
    if (filter === "all") return true;
    return m.status === filter;
  });

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Sender",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className={`font-semibold ${row.status === "new" ? "text-gray-900" : "text-gray-500"}`}>
            {row.name}
          </span>
          <span className="text-xs text-gray-400">{row.email}</span>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (row) => (
        <div className="max-w-xs truncate text-sm text-gray-600">
          {row.subject}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === "read" ? "default" : "warning"}>
          {row.status || "new"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => dispatch(toggleInquiryReadAction({ id: row.id, currentStatus: row.status }))}
          >
            {row.status === "read" ? (
              <ClockIcon className="w-5 h-5 text-gray-400" title="Mark as new" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-success-600" title="Mark as read" />
            )}
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="p-1"
            onClick={() => dispatch(deleteInquiryAction(row.id))}
          >
            <TrashIcon className="w-5 h-5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Inquiries</h1>
          <p className="text-gray-500 text-sm">Review and respond to platform support requests.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-md">
          {["all", "new", "read"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${filter === f
                  ? "bg-white text-primary-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={isLoading}
        searchKey="name"
        searchPlaceholder="Search senders..."
      />
    </div>
  );
};
