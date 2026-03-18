const STATUS_OPTIONS = [
  { value: "todo", label: "To do" },
  { value: "progress", label: "In progress" },
  { value: "cancelled", label: "Cancelled" },
  { value: "done", label: "Done" },
  { value: "archived", label: "Archived" },
];

const PRIORITY_OPTIONS = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
];

function formatDate(dateString) {
  if (!dateString) return "";
  // We expect a "YYYY-MM-DD" coming from an input type="date".
  // Keep it as text to avoid timezone-related issues.
  return dateString;
}

function statusLabel(status) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

export { STATUS_OPTIONS, PRIORITY_OPTIONS, formatDate, statusLabel };

