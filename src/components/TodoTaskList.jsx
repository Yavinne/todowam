import React from "react";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, statusLabel } from "../lib/todoUtils";

function priorityLabel(priority) {
  return PRIORITY_OPTIONS.find((p) => p.value === priority)?.label ?? String(priority);
}

function statusChipClass(status) {
  switch (status) {
    case "en_cours":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "annule":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "fait":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "archive":
      return "bg-slate-50 text-slate-800 border-slate-200";
    default:
      return "bg-gray-50 text-gray-800 border-gray-200";
  }
}

export default function TodoTaskList({
  tasks,
  onView,
  onEdit,
  onDelete,
  onSetStatus,
}) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
        No tasks yet. Add one above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">{task.name}</div>
              <div className="mt-1 text-xs text-gray-500">
                {task.category ? `Category: ${task.category}` : "No category"} · Priority:{" "}
                {priorityLabel(task.priority)}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${statusChipClass(
                    task.status
                  )}`}
                >
                  {statusLabel(task.status)}
                </span>
                {task.startDate ? (
                  <span className="text-xs text-gray-600">
                    Start: <span className="font-medium">{task.startDate}</span>
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => onView?.(task)}
              >
                View details
              </button>
              <button
                type="button"
                className="rounded-md bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => onEdit?.(task)}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-md bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                onClick={() => onDelete?.(task.id)}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
            <div>
              <label className="sr-only" htmlFor={`status-${task.id}`}>
                Change status
              </label>
              <select
                id={`status-${task.id}`}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={task.status}
                onChange={(e) => onSetStatus?.(task.id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Immediate update</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

