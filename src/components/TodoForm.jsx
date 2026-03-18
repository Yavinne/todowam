import React, { useMemo, useState } from "react";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../lib/todoUtils";

function toDateInputValue(date) {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function fileToMeta(file) {
  const id = `${file.name}_${file.size}_${file.lastModified}`;
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  return {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    dataUrl,
  };
}

export default function TodoForm({
  mode,
  initialTask,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const [name, setName] = useState(initialTask?.name ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [category, setCategory] = useState(initialTask?.category ?? "");
  const [priority, setPriority] = useState(
    Number.isFinite(Number(initialTask?.priority)) ? Number(initialTask?.priority) : 2
  );
  const [createdAt, setCreatedAt] = useState(initialTask?.createdAt ?? today);
  const [startDate, setStartDate] = useState(initialTask?.startDate ?? today);
  const [status, setStatus] = useState(initialTask?.status ?? "en_cours");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  const existingFiles = Array.isArray(initialTask?.files) ? initialTask.files : [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      let files;
      if (selectedFiles.length > 0) {
        files = await Promise.all(selectedFiles.map(fileToMeta));
      } else {
        files = existingFiles;
      }

      await onSubmit({
        ...initialTask,
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        priority,
        createdAt,
        startDate,
        status,
        files,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor={`${mode}-name`} className="mb-1 block text-sm font-medium">
            Name *
          </label>
          <input
            id={`${mode}-name`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor={`${mode}-category`}
            className="mb-1 block text-sm font-medium"
          >
            Category
          </label>
          <input
            id={`${mode}-category`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${mode}-description`}
          className="mb-1 block text-sm font-medium"
        >
            Description
        </label>
        <textarea
          id={`${mode}-description`}
          className="min-h-[90px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor={`${mode}-priority`}
            className="mb-1 block text-sm font-medium"
          >
            Priority
          </label>
          <select
            id={`${mode}-priority`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`${mode}-createdAt`}
            className="mb-1 block text-sm font-medium"
          >
            Created date
          </label>
          <input
            type="date"
            id={`${mode}-createdAt`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor={`${mode}-startDate`}
            className="mb-1 block text-sm font-medium"
          >
            Start date
          </label>
          <input
            type="date"
            id={`${mode}-startDate`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor={`${mode}-status`} className="mb-1 block text-sm font-medium">
            Status
          </label>
          <select
            id={`${mode}-status`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${mode}-files`} className="mb-1 block text-sm font-medium">
            Files
          </label>
          <input
            type="file"
            id={`${mode}-files`}
            className="w-full text-sm"
            multiple
            onChange={(e) => {
              setSelectedFiles(Array.from(e.target.files || []));
            }}
          />
          <div className="mt-1 text-xs text-gray-500">
            {selectedFiles.length > 0
              ? `${selectedFiles.length} file(s) selected`
              : existingFiles.length > 0
                ? `${existingFiles.length} existing file(s)`
                : "No file"}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel ? (
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => onCancel?.()}
            disabled={busy}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          disabled={busy}
        >
          {submitLabel ?? (mode === "edit" ? "Save" : "Add")}
        </button>
      </div>
    </form>
  );
}

