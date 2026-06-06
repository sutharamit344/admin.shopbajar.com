// src/components/table/DataTable.tsx
import React, { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { IconButton } from "../common/IconButton";
import { FormSelectField } from "../formFields/FormSelectField";
import { FormInputField } from "../formFields/FormInputField";
import { Button } from "../common/Button";
import { RefreshButton } from "../common/common";
import { getTextValue } from "../../utils/helper";
import { BulkUploadModal } from "./BulkUploadModal";
import { openDialog } from "../../store/dialogSlice";
import { useAppDispatch } from "../../app/hooks";
import * as XLSX from "xlsx";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "select" | "date";
  filterOptions?: { value: any; label: string }[];
  width?: string | number;
  align?: "left" | "center" | "right";
  sticky?: "left" | "right";
}

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showFirstLast?: boolean;
  showPageSize?: boolean;
  showPageJump?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: PaginationProps;
  onRefresh?: () => void;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
  idField?: keyof T | string;
  searchable?: boolean;
  searchPlaceholder?: string;
  title?: string;
  actions?: React.ReactNode;
  bulkActions?: (selectedItems: T[]) => React.ReactNode;
  exportable?: boolean;
  fileName?: string;
  bulkUpload?: {
    onUpload: (data: any[]) => Promise<void>;
    template?: any[];
    mapping?: Record<string, string>;
    validateRow?: (row: any, index: number) => { valid: boolean; errors?: string[] };
    maxFileSize?: number;
    allowedFileTypes?: string[];
  };
  emptyMessage?: string;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  onRowClick?: (item: T) => void;
  // Incremental Fetching Props
  isIncremental?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  totalCount?: number;
  incrementalMode?: "scroll" | "button";
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  pagination,
  onRefresh,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  idField = "id",
  searchable = true,
  searchPlaceholder = "Search...",
  title,
  actions,
  bulkActions,
  exportable = true,
  fileName = "data",
  bulkUpload,
  emptyMessage = "No data found",
  stickyHeader = true,
  maxHeight,
  onRowClick,
  isIncremental = false,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  totalCount,
  incrementalMode = "scroll",
}: DataTableProps<T>) {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({ key: "", direction: null });
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [pageInput, setPageInput] = useState("");

  const observerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isIncremental || !hasMore || isLoadingMore || isLoading || incrementalMode === "button") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore?.();
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isIncremental, hasMore, isLoadingMore, isLoading, incrementalMode, onLoadMore]);

  React.useEffect(() => {
    if (!isIncremental || !hasMore || isLoadingMore || isLoading || incrementalMode === "button") return;

    const handleScroll = (e: Event) => {
      const target = (e.target as HTMLElement) || document.documentElement;
      const scrollElem = target.scrollHeight ? target : document.documentElement;
      const { scrollHeight, scrollTop, clientHeight } = scrollElem;
      if (scrollHeight && scrollHeight - scrollTop - clientHeight < 200) {
        onLoadMore?.();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isIncremental, hasMore, isLoadingMore, isLoading, incrementalMode, onLoadMore]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(lowerSearch)
        )
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        result = result.filter((item) => {
          const itemValue = item[key];
          if (itemValue === undefined || itemValue === null) return false;
          return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig]);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange(filteredData.map((item) => item[idField as keyof T]));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectItem = (id: string | number) => {
    if (onSelectionChange) {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((sid) => sid !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredData.map((item) => {
      const row: Record<string, any> = {};
      columns.forEach((col) => {
        row[col.header] = getTextValue(item[col.key as keyof T]);
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;
  const startItem = pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 1;
  const endItem = pagination ? Math.min(pagination.page * pagination.pageSize, pagination.total) : filteredData.length;

  const pageNumbers = useMemo(() => {
    if (!pagination) return [];
    const current = pagination.page;
    const total = totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  }, [pagination, totalPages]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pagination) {
      const page = parseInt(pageInput);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        pagination.onPageChange(page);
        setPageInput("");
      }
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header/Toolbar */}
      <div className="px-4 py-3 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {selectedIds.length > 0 && (
            <p className="text-sm text-primary-600 font-medium">
              {selectedIds.length} items selected
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm min-w-[200px]"
              />
            </div>
          )}

          <IconButton
            icon={<FunnelIcon className="w-5 h-5" />}
            onClick={() => setShowFilters(!showFilters)}
            isActive={showFilters || Object.keys(filters).length > 0}
            tooltip="Toggle Filters"
            color={showFilters || Object.keys(filters).length > 0 ? "primary" : "gray"}
          />

          {onRefresh && (
            <RefreshButton onClick={onRefresh} isLoading={isLoading} />
          )}

          {exportable && (
            <IconButton
              icon={<ArrowDownTrayIcon className="w-5 h-5" />}
              onClick={handleExport}
              tooltip="Export to Excel"
              color="blue"
            />
          )}

          {bulkUpload && (
            <IconButton
              icon={<ArrowUpTrayIcon className="w-5 h-5" />}
              onClick={() => dispatch(openDialog({ id: "bulkupload", dialogName: "bulkupload", name: "Bulk Upload", type: "upload" }))}
              tooltip="Bulk Upload"
              color="green"
            />
          )}

          {actions}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && bulkActions && (
        <div className="px-4 py-2 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
          <span className="text-xs font-bold text-primary-700">{selectedIds.length} items selected for bulk actions</span>
          <div className="flex gap-2">
            {bulkActions(data.filter(item => selectedIds.includes(item[idField as keyof T])))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      {showFilters && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-in slide-in-from-top duration-200">
          {columns.filter(col => col.filterable).map(col => (
            <div key={String(col.key)}>
              <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{col.header}</label>
              {col.filterType === "select" ? (
                <FormSelectField
                  options={col.filterOptions || []}
                  value={filters[String(col.key)] || ""}
                  onChange={(e) => handleFilterChange(String(col.key), e.target.value)}
                  placeholder={`All ${col.header}`}
                  className="!py-1 !text-xs"
                />
              ) : (
                <FormInputField
                  type={col.filterType || "text"}
                  value={filters[String(col.key)] || ""}
                  onChange={(e) => handleFilterChange(String(col.key), e.target.value)}
                  placeholder={`Filter by ${col.header}`}
                  className="!py-1 !text-xs"
                />
              )}
            </div>
          ))}
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<XMarkIcon className="w-4 h-4" />}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div
        className="overflow-auto scrollbar-thin scrollbar-thumb-gray-300"
        style={{ maxHeight: maxHeight || "calc(100vh - 300px)" }}
        onScroll={(e) => {
          if (!isIncremental || !hasMore || isLoadingMore || isLoading || incrementalMode === "button") return;
          const target = e.currentTarget;
          if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
            onLoadMore?.();
          }
        }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`${stickyHeader ? "sticky top-0 z-10" : ""} bg-gray-50 shadow-sm`}>
            <tr>
              {selectable && (
                <th className="px-4 py-2.5 text-left w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-50"
                    onChange={handleSelectAll}
                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`
                    px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider
                    ${col.sortable ? "cursor-pointer hover:text-gray-900 transition-colors" : ""}
                    ${col.sticky === "left" ? "sticky left-0 bg-gray-50 z-20" : ""}
                    ${col.sticky === "right" ? "sticky right-0 bg-gray-50 z-20" : ""}
                  `}
                  style={{ width: col.width, textAlign: col.align || "left" }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className={`flex items-center gap-1 ${col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : ""}`}>
                    {col.header}
                    {col.sortable && sortConfig.key === col.key && (
                      <span className="text-primary-600">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && (!isIncremental || filteredData.length === 0) ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center">
                  <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                  <span className="text-gray-500">Loading data...</span>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr
                  key={item[idField as keyof T] || idx}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <th className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={selectedIds.includes(item[idField as keyof T])}
                        onChange={() => handleSelectItem(item[idField as keyof T])}
                      />
                    </th>
                  )}
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`
                        px-4 py-2.5 whitespace-nowrap text-xs text-gray-600 font-medium
                        ${col.sticky === "left" ? "sticky left-0 bg-white z-10 group-hover:bg-gray-50" : ""}
                        ${col.sticky === "right" ? "sticky right-0 bg-white z-10 group-hover:bg-gray-50" : ""}
                      `}
                      style={{ textAlign: col.align || "left" }}
                    >
                      {col.render ? col.render(item[col.key as keyof T], item) : item[col.key as keyof T]}
                    </td>
                  ))}
                </tr>
              ))
            )}
            {/* Incremental loading indicator at bottom of tbody */}
            {isIncremental && isLoadingMore && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-3 text-center bg-gray-50/50">
                  <div className="flex items-center justify-center gap-2 text-xs text-primary-600 font-medium">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Loading more items...</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Incremental Fetching Footer / Bar */}
      {isIncremental && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white text-xs text-gray-500 font-medium">
          <div>
            Showing <span className="font-bold text-gray-900">{filteredData.length}</span> {totalCount !== undefined ? `of ${totalCount}` : ""} items
          </div>
          <div>
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-xs text-primary-600 font-medium">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Fetching more...</span>
              </div>
            ) : hasMore ? (
              incrementalMode === "button" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadMore?.()}
                  leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                >
                  Load More
                </Button>
              ) : (
                <div ref={observerRef} className="text-xs text-gray-400 italic py-1 px-2 text-center w-full">
                  Scroll down to load more...
                </div>
              )
            ) : (
              <span className="text-xs text-gray-400">All data loaded</span>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isIncremental && pagination && pagination.total > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
          <div className="text-xs text-gray-500 font-medium">
            Showing {startItem} to {endItem} of {pagination.total} results
          </div>

          <div className="flex items-center gap-2">
            {pagination.showPageSize !== false && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-gray-500">Show</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {(pagination.pageSizeOptions || [10, 25, 50, 100]).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}

            <IconButton
              icon={<ChevronLeftIcon className="w-4 h-4" />}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              size="sm"
              variant="outline"
            />

            <div className="hidden md:flex items-center gap-1">
              {pageNumbers.map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      onClick={() => pagination.onPageChange(Number(page))}
                      className={`
                        w-8 h-8 text-sm rounded-md transition-colors
                        ${pagination.page === page ? "bg-primary-600 text-white" : "hover:bg-gray-100 text-gray-600"}
                      `}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <IconButton
              icon={<ChevronRightIcon className="w-4 h-4" />}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              size="sm"
              variant="outline"
            />

            {pagination.showPageJump !== false && totalPages > 1 && (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-gray-500">Go to</span>
                <input
                  type="text"
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onKeyDown={handlePageInputKeyPress}
                  className="w-12 px-1 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Page"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {bulkUpload && (
        <BulkUploadModal
          dialogName="bulkupload"
          onUpload={bulkUpload.onUpload}
          template={bulkUpload.template}
          mapping={bulkUpload.mapping}
          validateRow={bulkUpload.validateRow}
          maxFileSize={bulkUpload.maxFileSize}
          allowedFileTypes={bulkUpload.allowedFileTypes}
          fileName={fileName}
        />
      )}
    </div>
  );
}
