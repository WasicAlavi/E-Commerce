export const ORDER_STATUS_MAP = {
  pending:   { label: "Pending", color: "warning" },
  processing:{ label: "Processing", color: "info" },
  approved:  { label: "Approved", color: "info" },
  shipped:   { label: "Shipped", color: "primary" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
};

export function getOrderStatusLabelAndColor(status) {
  if (!status) return { label: "Unknown", color: "default" };
  const key = status.toLowerCase();
  return ORDER_STATUS_MAP[key] || { label: status, color: "default" };
} 