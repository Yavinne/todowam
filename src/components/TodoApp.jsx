import React, { useEffect, useMemo, useState } from "react";
import { createTodoRepository } from "../lib/todoRepository";
import TodoForm from "./TodoForm";
import TodoTaskList from "./TodoTaskList";
import TodoTaskDetailModal from "./TodoTaskDetailModal";
import Modal from "./Modal";

const DEFAULT_API_URL = process.env.REACT_APP_TODO_API_URL;
const DEFAULT_API_KEY = process.env.REACT_APP_TODO_API_KEY;

function sortTasks(tasks) {
  // Sort by start date, then creation date (descending). If empty, it goes to the end.
  return [...tasks].sort((a, b) => {
    const aStart = a.startDate || "";
    const bStart = b.startDate || "";
    if (aStart !== bStart) return bStart.localeCompare(aStart);
    const aCreated = a.createdAt || "";
    const bCreated = b.createdAt || "";
    return bCreated.localeCompare(aCreated);
  });
}

export default function TodoApp() {
  const repository = useMemo(
    () => createTodoRepository({ apiUrl: DEFAULT_API_URL, apiKey: DEFAULT_API_KEY }),
    []
  );

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detailTask, setDetailTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await repository.listTasks();
        if (!mounted) return;
        setTasks(sortTasks(list));
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Unable to load tasks");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [repository]);

  async function handleAdd(draft) {
    const task = await repository.createTask(draft);
    setTasks((prev) => sortTasks([...prev, task]));
    setFormKey((k) => k + 1);
  }

  async function handleDelete(id) {
    await repository.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (detailTask?.id === id) setDetailTask(null);
    if (editTask?.id === id) setEditTask(null);
  }

  async function handleEditSubmit(updated) {
    const task = await repository.updateTask(updated.id, updated);
    setTasks((prev) => sortTasks(prev.map((t) => (t.id === task.id ? task : t))));
    setEditTask(null);
  }

  async function handleSetStatus(id, status) {
    const task = await repository.setStatus(id, status);
    setTasks((prev) => sortTasks(prev.map((t) => (t.id === task.id ? task : t))));
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TodoWam</h1>
          <p className="mt-1 text-sm text-gray-600">
            Default persistence via <span className="font-medium">localStorage</span>. API mode if{" "}
            <span className="font-medium">REACT_APP_TODO_API_URL</span> is provided.
          </p>
        </div>
        <div className="text-xs text-gray-500">
          {loading ? "Loading..." : `${tasks.length} task(s)`}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Add a task</h2>
          <div className="mt-3">
            <TodoForm
              key={formKey}
              mode="add"
              initialTask={null}
              onSubmit={handleAdd}
              submitLabel="Add"
            />
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900">Task list</h2>
            <button
              type="button"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              onClick={() => {
                // Reload from persistence.
                (async () => {
                  setLoading(true);
                  try {
                    const list = await repository.listTasks();
                    setTasks(sortTasks(list));
                    setError("");
                  } catch (e) {
                    setError(e?.message || "Unable to reload tasks");
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
            >
              Refresh
            </button>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="text-sm text-gray-600">Loading...</div>
            ) : (
              <TodoTaskList
                tasks={tasks}
                onView={(t) => setDetailTask(t)}
                onEdit={(t) => setEditTask(t)}
                onDelete={(id) => handleDelete(id)}
                onSetStatus={(id, status) => handleSetStatus(id, status)}
              />
            )}
          </div>
        </section>
      </div>

      <TodoTaskDetailModal
        open={Boolean(detailTask)}
        task={detailTask}
        onClose={() => setDetailTask(null)}
      />

      <Modal open={Boolean(editTask)} title="Edit task" onClose={() => setEditTask(null)}>
        {editTask ? (
          <TodoForm
            key={editTask.id}
            mode="edit"
            initialTask={editTask}
            onCancel={() => setEditTask(null)}
            onSubmit={async (updatedDraft) => handleEditSubmit(updatedDraft)}
            submitLabel="Save"
          />
        ) : null}
      </Modal>
    </div>
  );
}

