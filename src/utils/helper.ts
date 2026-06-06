export const getTextValue = (value: any): string | number | boolean => {
  if (value === null || value === undefined) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  // If React element
  if (value?.props?.children) {
    if (typeof value.props.children === "string") {
      return value.props.children;
    }

    if (Array.isArray(value.props.children)) {
      return value.props.children.join(" ");
    }
  }

  return String(value);
};

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
};
