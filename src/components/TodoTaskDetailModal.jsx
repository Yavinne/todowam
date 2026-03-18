import React from "react";
import Modal from "./Modal";
import { PRIORITY_OPTIONS, statusLabel } from "../lib/todoUtils";

function priorityLabel(priority) {
  return PRIORITY_OPTIONS.find((p) => p.value === priority)?.label ?? String(priority);
}

export default function TodoTaskDetailModal({ open, task, onClose }) {
  if (!task) return <Modal open={open} title="Task details" onClose={onClose} />;

  return (
    <Modal open={open} title="Task details" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-gray-900">{task.name}</div>
          <div className="mt-1 text-sm text-gray-600">
            {task.category ? `Category: ${task.category}` : "No category"} · Priority:{" "}
            {priorityLabel(task.priority)}
          </div>
          <div className="mt-2 text-sm">
            Status: <span className="font-medium">{statusLabel(task.status)}</span>
          </div>
          {task.createdAt ? (
            <div className="text-sm text-gray-600">
              Created date: <span className="font-medium">{task.createdAt}</span>
            </div>
          ) : null}
          {task.startDate ? (
            <div className="text-sm text-gray-600">
              Start date: <span className="font-medium">{task.startDate}</span>
            </div>
          ) : null}
        </div>

        <div>
          <div className="text-sm font-medium text-gray-900">Description</div>
          <div className="mt-1 whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
            {task.description || "—"}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-900">Files</div>
          {Array.isArray(task.files) && task.files.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {task.files.map((f) => (
                <li key={f.id || f.name} className="rounded-md border border-gray-200 bg-white p-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-gray-900">{f.name}</div>
                      <div className="text-xs text-gray-500">
                        {f.type || "application/octet-stream"} · {f.size ? `${f.size} bytes` : ""}
                      </div>
                    </div>
                    {f.dataUrl ? (
                      <a
                        className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        href={f.dataUrl}
                        download={f.name}
                      >
                        Download
                      </a>
                    ) : (
                      <span className="shrink-0 text-xs text-gray-500">Not downloadable</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-2 text-sm text-gray-600">No files.</div>
          )}
        </div>
      </div>
    </Modal>
  );
}

