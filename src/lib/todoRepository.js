const STORAGE_KEY = "todowam.tasks.v1";

function generateId() {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  return `id_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeTask(task) {
  return {
    id: task.id,
    name: task.name ?? "",
    description: task.description ?? "",
    category: task.category ?? "",
    priority: Number.isFinite(Number(task.priority)) ? Number(task.priority) : 2,
    createdAt: task.createdAt ?? "",
    startDate: task.startDate ?? "",
    status: task.status ?? "en_cours",
    files: Array.isArray(task.files) ? task.files : [],
  };
}

function loadTasksFromLocalStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = safeJsonParse(raw, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeTask);
}

function saveTasksToLocalStorage(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createLocalTodoRepository() {
  return {
    listTasks: async () => loadTasksFromLocalStorage(),
    createTask: async (draft) => {
      const task = normalizeTask({
        ...draft,
        id: draft.id ?? generateId(),
      });
      const tasks = loadTasksFromLocalStorage();
      tasks.push(task);
      saveTasksToLocalStorage(tasks);
      return task;
    },
    updateTask: async (id, updates) => {
      const tasks = loadTasksFromLocalStorage();
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Task not found");
      const next = normalizeTask({ ...tasks[idx], ...updates, id });
      tasks[idx] = next;
      saveTasksToLocalStorage(tasks);
      return next;
    },
    deleteTask: async (id) => {
      const tasks = loadTasksFromLocalStorage();
      const next = tasks.filter((t) => t.id !== id);
      saveTasksToLocalStorage(next);
    },
    setStatus: async (id, status) => {
      return tasksUpdateStatus(id, status, loadTasksFromLocalStorage, saveTasksToLocalStorage);
    },
  };
}

function tasksUpdateStatus(id, status, load, save) {
  const tasks = load();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return Promise.reject(new Error("Task not found"));
  const updated = normalizeTask({ ...tasks[idx], status });
  tasks[idx] = updated;
  save(tasks);
  return Promise.resolve(updated);
}

function createApiTodoRepository({ apiUrl, apiKey } = {}) {
  async function apiFetch(path, { method, body } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    const res = await fetch(`${apiUrl}${path}`, {
      method: method ?? "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API error ${res.status}: ${text || res.statusText}`);
    }
    return res;
  }

  return {
    listTasks: async () => {
      const res = await apiFetch("/tasks", { method: "GET" });
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map(normalizeTask);
    },
    createTask: async (draft) => {
      const res = await apiFetch("/tasks", { method: "POST", body: draft });
      const data = await res.json();
      return normalizeTask(data);
    },
    updateTask: async (id, updates) => {
      const res = await apiFetch(`/tasks/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: updates,
      });
      const data = await res.json();
      return normalizeTask(data);
    },
    deleteTask: async (id) => {
      await apiFetch(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
    setStatus: async (id, status) => {
      return createApiTodoRepository({ apiUrl, apiKey }).updateTask(id, { status });
    },
  };
}

function createTodoRepository({ apiUrl, apiKey } = {}) {
  if (apiUrl) return createApiTodoRepository({ apiUrl, apiKey });
  return createLocalTodoRepository();
}

export { STORAGE_KEY, createTodoRepository, normalizeTask };

