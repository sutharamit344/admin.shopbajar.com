// src/components/common/common.tsx
import React from "react";
import { IconButton, type IconButtonProps } from "./IconButton";
import { FaRotate } from "react-icons/fa6";
import {
  IoAddOutline,
  IoCloseOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import { MdDelete, MdToggleOff, MdToggleOn } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
import { FiEdit } from "react-icons/fi";

type PredefinedIconButtonProps = Omit<IconButtonProps, "icon">;

export const AddIconButton: React.FC<PredefinedIconButtonProps> = (props) => (
  <IconButton icon={<IoAddOutline />} color="green" tooltip="Add" {...props} />
);

export const ActiveInActiveButton: React.FC<PredefinedIconButtonProps> = (
  props,
) => {
  return (
    <IconButton
      icon={
        <span>
          {props.isActive ? (
            <MdToggleOn size={32} />
          ) : (
            <MdToggleOff size={32} />
          )}
        </span>
      }
      size="md"
      color={props.isActive ? "green" : "red"}
      tooltip="Active / Inactive"
      {...props}
    />
  );
};

export const EditIconButton: React.FC<PredefinedIconButtonProps> = (props) => (
  <IconButton icon={<FiEdit size={18} />} color="blue" size="xs" {...props} />
);

export const DeleteIconButton: React.FC<PredefinedIconButtonProps> = (
  props,
) => (
  <IconButton
    icon={<MdDelete size={22} />}
    size="xs"
    color="red"
    tooltip="Delete"
    {...props}
  />
);

export const ViewIconButton: React.FC<PredefinedIconButtonProps> = (props) => (
  <IconButton
    icon={<IoMdEye size={28} />}
    color="violet"
    tooltip="View"
    {...props}
  />
);

export const RefreshButton: React.FC<PredefinedIconButtonProps> = (props) => (
  <IconButton
    icon={
      props?.isLoading ? <FaRotate className="animate-spin" /> : <FaRotate />
    }
    color="secondary"
    tooltip="Refresh"
    size="md"
    {...props}
  />
);

export const CheckIconButton: React.FC<PredefinedIconButtonProps> = (props) => (
  <IconButton
    icon={<IoCheckmarkOutline />}
    color="green"
    tooltip="Confirm"
    {...props}
  />
);

export const CloseIconButton: React.FC<PredefinedIconButtonProps> = (props) => (
  <IconButton
    icon={<IoCloseOutline />}
    color="gray"
    tooltip="Close"
    {...props}
  />
);
