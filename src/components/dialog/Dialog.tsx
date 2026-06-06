// src/components/dialog/Dialog.tsx
import React, { Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../common/Button";
import { useLocation } from "react-router-dom";
import { clearDialogs } from "../../store/dialogSlice";
import { useAppSelector, useAppDispatch } from "../../app/hooks";

export type DialogType = "info" | "success" | "warning" | "error" | "confirm";

export interface AppDialogProps {
  dialogName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  type?: DialogType;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  dialogNames?: string;
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "sm:max-w-4xl",
};

const typeIcons = {
  info: <InformationCircleIcon className="w-6 h-6 text-blue-600" />,
  success: <CheckCircleIcon className="w-6 h-6 text-green-600" />,
  warning: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />,
  error: <ExclamationCircleIcon className="w-6 h-6 text-red-600" />,
  confirm: <ExclamationTriangleIcon className="w-6 h-6 text-primary-600" />,
};

const typeColors = {
  info: "bg-blue-100",
  success: "bg-green-100",
  warning: "bg-yellow-100",
  error: "bg-red-100",
  confirm: "bg-primary-100",
};

const AppDialog: React.FC<AppDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  type = "info",
  size = "md",
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  isLoading = false,
  icon,
  footer,
  className = "",
}) => {
  const open = useAppSelector((state) => state.dialog.open);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape") {
        onClose?.();
      }
    };

    if (isOpen || open) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, open, closeOnEsc, onClose]);

  useEffect(() => {
    return () => {
      dispatch(clearDialogs());
    };
  }, [location.pathname, dispatch]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnClickOutside && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <Transition appear show={isOpen || open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => (closeOnClickOutside ? onClose?.() : {})}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div
            className="flex min-h-full items-center justify-center p-4 text-center"
            onClick={handleBackdropClick}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-md bg-white text-left align-middle shadow-xl transition-all ${className}`}
              >
                {showCloseButton && (
                  <button
                    onClick={() => onClose?.()}
                    className="absolute right-5 top-5 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}

                <div className="p-6">
                  {(title || icon || type) && (
                    <div className="flex items-start gap-4 mb-4">
                      {icon && <div className="shrink-0">{icon}</div>}
                      {!icon && type && typeIcons[type] && (
                        <div
                          className={`shrink-0 p-2 rounded-full ${typeColors[type]}`}
                        >
                          {typeIcons[type]}
                        </div>
                      )}
                      <div className="flex-1">
                        {title && (
                          <Dialog.Title
                            as="h3"
                            className="text-lg font-semibold leading-6 text-gray-900"
                          >
                            {title}
                          </Dialog.Title>
                        )}
                        {description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {children && <div className="mt-4">{children}</div>}

                  {(footer || onConfirm || showCancel) && (
                    <div className="mt-6 flex justify-end gap-3">
                      {footer ? (
                        footer
                      ) : (
                        <>
                          {showCancel && (
                            <Button
                              variant="outline"
                              className={
                                type === "error"
                                  ? "border-red-500 text-red-500 hover:bg-red-50"
                                  : ""
                              }
                              onClick={() => onClose?.()}
                              disabled={isLoading}
                            >
                              {cancelText}
                            </Button>
                          )}
                          {onConfirm && (
                            <Button
                              variant={type === "error" ? "danger" : "primary"}
                              onClick={onConfirm}
                              isLoading={isLoading}
                            >
                              {confirmText}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export const NameDialog: React.FC<AppDialogProps> = (props) => {
  const dialog = useAppSelector((state) => state.dialog.dialog);
  const dName = props.dialogName || props.dialogNames;
  if (!dName) return null;
  if (!dialog || !dialog[dName] || dialog[dName].length === 0) return null;
  return <AppDialog {...props} />;
};

export default AppDialog;
