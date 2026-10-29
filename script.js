
const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");
const empty = document.getElementById("emptyState");

let tasks = [];
let filter = "all";

try {
  const saved = JSON.parse(localStorage.getItem("petalTasks") || "[]");
  if (Array.isArray(saved)) {
    tasks = saved.filter(task =>
      task &&
      Number.isInteger(task.id) &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean"
    );
  }
} catch {
  tasks = [];
}

function saveTasks() {
  try {
    localStorage.setItem("petalTasks", JSON.stringify(tasks));
  } catch {
    // The list still works if browser storage is unavailable.
  }
}

function addTask(text) {
  const name = text.trim();
  if (!name) return;

  tasks.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    text: name,
    completed: false
  });

  saveTasks();
  renderTasks();
}

function updateTask(id, completed) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed } : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  list.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = "task" + (task.completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task completed");
    checkbox.addEventListener("change", () =>
      updateTask(task.id, checkbox.checked)
    );

    const name = document.createElement("span");
    name.className = "task-name";
    name.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete";
    remove.type = "button";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", "Delete " + task.text);
    remove.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, name, remove);
    list.appendChild(item);
  });

  empty.hidden = visibleTasks.length > 0;

  const total = tasks.length;
  const done = tasks.filter(task => task.completed).length;
  const percent = total ? Math.round(done / total * 100) : 0;

  document.getElementById("taskCount").textContent =
    total + (total === 1 ? " task" : " tasks");

  document.getElementById("progressNumber").textContent = percent + "%";
  document.getElementById("progressBar").style.width = percent + "%";

  document.getElementById("progressText").textContent =
    total === 0 ? "A fresh start ✨" :
    percent === 100 ? "Everything is done! ♡" :
    done + " of " + total + " completed";
}

form.addEventListener("submit", event => {
  event.preventDefault();
  addTask(input.value);
  input.value = "";
  input.focus();
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    renderTasks();
  });
});

renderTasks();
