// src/components/dialog/DeleteDialog.tsx
import React from "react";
import { IoWarningOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import type { AppDialogProps } from "./Dialog";
import { NameDialog } from "./Dialog";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { closeDialog } from "../../store/dialogSlice";

export interface DeleteDialogProps extends Omit<AppDialogProps, "type"> {
  itemName?: string;
  itemType?: string;
  onConfirm: (id?: any) => void;
  onCancel?: () => void;
  isDeleting?: boolean;
  showItemDetails?: boolean;
  itemDetails?: React.ReactNode;
  warningMessage?: string;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  onClose: _onClose,
  onConfirm,
  onCancel,
  title,
  description,
  itemName: _itemName,
  itemType = "item",
  isDeleting = false,
  showItemDetails: _showItemDetails = true,
  itemDetails,
  warningMessage,
  confirmText = "Delete",
  cancelText = "Cancel",
  size = "md",
  ...props
}) => {
  const dialog = useAppSelector((state) => state.dialog.dialog);
  const loading = useAppSelector((state) => state.dialog.loading);
  const dispatch = useAppDispatch();

  const titleText =
    title ||
    `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1).toLowerCase()}`;
  const dialogName = `confirm${itemType ? itemType?.toLowerCase() : ""}delete`;

  const itemdetail = dialog[dialogName]?.find(
    (item) => item.dialogName === dialogName,
  );

  const defaultDescription = itemdetail
    ? `Are you sure you want to delete this ${itemType}?`
    : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  const handleConfirm = async () => {
    if (itemdetail?.id) {
      await onConfirm(itemdetail?.id);
      dispatch(closeDialog(dialogName));
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    dispatch(closeDialog(dialogName));
  };

  return (
    <NameDialog
      dialogNames={dialogName}
      onClose={handleCancel}
      title={titleText}
      description={description || defaultDescription}
      type="error"
      size={size}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={handleConfirm}
      isLoading={isDeleting || loading}
      showCancel={true}
      icon={
        <div className="p-3 bg-red-100 rounded-full">
          <IoWarningOutline className="w-6 h-6 text-red-600" />
        </div>
      }
      {...props}
    >
      {itemdetail && (
        <div className="p-1 bg-red-50 rounded-md border border-red-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-md">
              <MdDelete className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900 capitalize">
                {itemType}:{" "}
              </span>
              <span className="text-base font-semibold text-red-600">
                {itemdetail.name}
              </span>
            </div>
          </div>
          {itemDetails && (
            <div className="mt-2 text-sm text-gray-600 p-2">{itemDetails}</div>
          )}
        </div>
      )}

      {warningMessage && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <IoWarningOutline className="w-4 h-4 text-yellow-600" />
            {warningMessage}
          </p>
        </div>
      )}

      {props.children}
    </NameDialog>
  );
};
