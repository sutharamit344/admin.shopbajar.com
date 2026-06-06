// src/components/drawer/Drawer.tsx
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { IconButton } from "../common/IconButton";
import { closed } from "../../store/drawerSlice";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DrawerProps {
  children?: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
}

const anchorStyles = {
  left: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
    style: { left: 0, top: 0, bottom: 0 },
  },
  right: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    style: { right: 0, top: 0, bottom: 0 },
  },
  top: {
    initial: { y: "-100%" },
    animate: { y: 0 },
    exit: { y: "-100%" },
    style: { top: 0, left: 0, right: 0, height: "auto", maxHeight: "90vh" },
  },
  bottom: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    style: { bottom: 0, left: 0, right: 0, height: "auto", maxHeight: "90vh" },
  },
};

export const Drawer: React.FC<DrawerProps> = ({
  children,
  title,
  onClose,
  footer,
  closeOnBackdropClick = true,
  closeOnEsc = true,
}) => {
  const dispatch = useAppDispatch();
  const {
    open,
    anchor = "right",
    drawerWidth,
    title: storeTitle,
  } = useAppSelector((state) => state.drawer);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape" && open) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, closeOnEsc]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      dispatch(closed());
    }
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      handleClose();
    }
  };

  if (!mounted) return null;

  const displayTitle = title || storeTitle;
  const width =
    anchor === "left" || anchor === "right" ? drawerWidth || 400 : "100%";
  const height =
    anchor === "top" || anchor === "bottom" ? drawerWidth || "auto" : "100%";

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 bg-opacity-50 backdrop-blur-sm z-40"
            onClick={handleBackdropClick}
          />

          <motion.div
            initial={anchorStyles[anchor].initial}
            animate={anchorStyles[anchor].animate}
            exit={anchorStyles[anchor].exit}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed bg-white shadow-xl z-50 flex flex-col"
            style={{
              ...anchorStyles[anchor].style,
              width,
              height,
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                {displayTitle && (
                  <h2 className="text-lg font-semibold text-gray-900">
                    {displayTitle}
                  </h2>
                )}
              </div>
              <IconButton
                icon={<XMarkIcon className="w-5 h-5" />}
                onClick={handleClose}
                color="gray"
                size="sm"
                tooltip="Close"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6">{children}</div>

            {footer && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};
