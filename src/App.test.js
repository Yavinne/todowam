import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";
import { STORAGE_KEY } from "./lib/todoRepository";

beforeEach(() => {
  localStorage.clear();
});

function fillBasicTaskForm() {
  fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Task 1" } });
  fireEvent.change(screen.getByLabelText(/Description/i), {
    target: { value: "Task description" },
  });
  fireEvent.change(screen.getByLabelText(/Category/i), {
    target: { value: "Work" },
  });
  fireEvent.change(screen.getByLabelText(/Priority/i), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText(/Created date/i), {
    target: { value: "2026-03-18" },
  });
  fireEvent.change(screen.getByLabelText(/Start date/i), {
    target: { value: "2026-03-20" },
  });
  fireEvent.change(screen.getByLabelText(/Status/i), {
    target: { value: "en_cours" },
  });
}

test("renders the form and the list", () => {
  render(<App />);
  expect(screen.getByText(/Add a task/i)).toBeInTheDocument();
  expect(screen.getByText(/Task list/i)).toBeInTheDocument();
});

test("adds a task and persists it to localStorage", async () => {
  render(<App />);
  fillBasicTaskForm();

  const fileInput = screen.getByLabelText(/Files/i);

  // Mock FileReader to allow dataUrl persistence in tests.
  class MockFileReader {
    readAsDataURL() {
      this.result = "data:text/plain;base64,SGVsbG8=";
      if (this.onload) this.onload();
    }
  }
  global.FileReader = MockFileReader;

  const file = new File(["hello"], "test.txt", { type: "text/plain" });
  fireEvent.change(fileInput, { target: { files: [file] } });

  fireEvent.click(screen.getByRole("button", { name: /Add/i }));

  expect(await screen.findByText("Task 1")).toBeInTheDocument();

  const raw = localStorage.getItem(STORAGE_KEY);
  expect(raw).toBeTruthy();
  const parsed = JSON.parse(raw);
  expect(parsed).toHaveLength(1);
  expect(parsed[0].name).toBe("Task 1");
  expect(parsed[0].files?.[0]?.name).toBe("test.txt");

  // Verify the details modal.
  fireEvent.click(screen.getByRole("button", { name: /View details/i }));
  expect(await screen.findByText(/test\.txt/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Download/i })).toBeInTheDocument();
});

test("edits a task name and changes its status", async () => {
  render(<App />);
  fillBasicTaskForm();
  fireEvent.click(screen.getByRole("button", { name: /Add/i }));

  const nameNode = await screen.findByText("Task 1");
  expect(nameNode).toBeInTheDocument();

  // Edit the task
  fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
  const dialog = screen.getByRole("dialog", { name: /Edit task/i });
  const nameInput = within(dialog).getByLabelText(/Name/i);
  fireEvent.change(nameInput, { target: { value: "Task 1 modified" } });
  fireEvent.click(screen.getByRole("button", { name: /Save/i }));

  await waitFor(() => {
    expect(screen.getByText("Task 1 modified")).toBeInTheDocument();
  });

  // Change status (immediate select)
  const statusSelect = screen.getByLabelText(/Change status/i);
  fireEvent.change(statusSelect, { target: { value: "fait" } });

  await waitFor(() => {
    const matches = screen.getAllByText(/Done/i);
    const chip = matches.find((el) => el.tagName === "SPAN");
    expect(chip).toBeTruthy();
  });
});

test("deletes a task", async () => {
  render(<App />);
  fillBasicTaskForm();
  fireEvent.click(screen.getByRole("button", { name: /Add/i }));

  expect(await screen.findByText("Task 1")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
  expect(await screen.findByText(/No tasks yet/i)).toBeInTheDocument();
});
