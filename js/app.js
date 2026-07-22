/* ==========================================
   App State
========================================== */

let tasks = [];

/* ==========================================
   DOM Elements
========================================== */

const elements = {
  form: document.querySelector("#task-form"),
  title: document.querySelector("#task-title"),
  category: document.querySelector("#task-category"),
  priority: document.querySelector("#task-priority"),
  date: document.querySelector("#task-date"),

  taskList: document.querySelector("#task-list"),

  totalTasks: document.querySelector("#total-tasks"),
  completedTasks: document.querySelector("#completed-tasks"),
  progress: document.querySelector("#progress-percent"),
};

/* ==========================================
   Initialization
========================================== */

function init() {
  tasks = loadTasks();

  bindEvents();

  render();
}

/* ==========================================
   Event Binding
========================================== */

function bindEvents() {
  elements.form.addEventListener("submit", handleAddTask);

  elements.taskList.addEventListener("click", handleTaskActions);
}

/* ==========================================
   Event Handlers
========================================== */

function handleAddTask(event) {
  event.preventDefault();

  const title = elements.title.value.trim();

  if (!title) {
    showToast("Task title is required.", "error");
    return;
  }

  const task = {
    id: generateId(),

    title,

    category: elements.category.value,

    priority: elements.priority.value,

    dueDate: elements.date.value,

    completed: false,

    createdAt: new Date().toISOString(),
  };

  tasks.unshift(task);

  saveTasks();

  render();

  elements.form.reset();

  showToast("Task added successfully.");
}

function handleTaskActions(event) {
  const deleteButton = event.target.closest(".delete-btn");

  if (deleteButton) {
    deleteTask(deleteButton.dataset.id);

    return;
  }

  const completeButton = event.target.closest(".task-check");

  if (completeButton) {
    toggleTask(completeButton.dataset.id);
  }
}

/* ==========================================
   Task Operations
========================================== */

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();

  render();

  showToast("Task deleted.");
}

function toggleTask(id) {
  const task = tasks.find((task) => task.id === id);

  if (!task) return;

  task.completed = !task.completed;

  saveTasks();

  render();

  showToast(task.completed ? "Task completed." : "Task marked as active.");
}

/* ==========================================
   Rendering
========================================== */

function render() {
  renderTasks();

  updateStats();
}

function renderTasks() {
  if (!tasks.length) {
    elements.taskList.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-circle-check"></i>

                <h3>No tasks yet</h3>

                <p>Create your first task to get started.</p>

            </div>

        `;

    return;
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return a.completed ? 1 : -1;
  });

  elements.taskList.innerHTML = sortedTasks.map(createTaskCard).join("");
}
/* ==========================================
   Task Card
========================================== */

function createTaskCard(task) {
  return `

        <article class="task-card ${task.completed ? "completed" : ""}">

            <div class="task-left">

                <button
                    class="task-check ${task.completed ? "completed" : ""}"
                    data-id="${task.id}">

                    <i class="fa-solid fa-check"></i>

                </button>

                <div class="task-content">

                    <h4 class="task-title">

                        ${task.title}

                    </h4>

                    <div class="task-meta">

                        <span class="task-badge category">

                            ${task.category}

                        </span>

                        <span class="task-badge priority ${task.priority.toLowerCase()}">

                            ${task.priority}

                        </span>

                        <span class="task-date">

                            <i class="fa-regular fa-calendar"></i>

                            ${formatDate(task.dueDate)}

                        </span>

                    </div>

                </div>

            </div>

            <div class="task-actions">

                <button
                    class="icon-btn edit-btn"
                    data-id="${task.id}">

                    <i class="fa-regular fa-pen-to-square"></i>

                </button>

                <button
                    class="icon-btn danger delete-btn"
                    data-id="${task.id}">

                    <i class="fa-regular fa-trash-can"></i>

                </button>

            </div>

        </article>

    `;
}

/* ==========================================
   Statistics
========================================== */

function updateStats() {
  const completed = tasks.filter((task) => task.completed).length;

  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  elements.totalTasks.textContent = tasks.length;

  elements.completedTasks.textContent = completed;

  elements.progress.textContent = `${progress}%`;
}

/* ==========================================
   Date Formatting
========================================== */

function formatDate(date) {
  if (!date) {
    return "No Due Date";
  }

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",

    day: "numeric",
  });
}

/* ==========================================
   Toast Notifications
========================================== */

function showToast(message, type = "success") {
  const existing = document.querySelector(".toast");

  if (existing) {
    existing.remove();
  }

  const toast = document.createElement("div");

  toast.className = `toast toast-${type}`;

  toast.innerHTML = `

        <span>${message}</span>

    `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 2200);
}

/* ==========================================
   Local Storage
========================================== */

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const data = localStorage.getItem("tasks");

  return data ? JSON.parse(data) : [];
}

/* ==========================================
   Utilities
========================================== */

function generateId() {
  return crypto.randomUUID();
}

/* ==========================================
   Start Application
========================================== */

init();
