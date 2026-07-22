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

  if (!title) return;

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
}
function handleTaskActions(event) {
  const deleteButton = event.target.closest(".delete-btn");

  if (deleteButton) {
    deleteTask(deleteButton.dataset.id);
  }
}
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();

  render();
}

/* ==========================================
   Rendering
========================================== */

function render() {
  renderTasks();

  updateStats();
}

function renderTasks() {
  if (tasks.length === 0) {
    elements.taskList.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-circle-check"></i>

                <h3>No tasks yet</h3>

                <p>Create your first task to get started.</p>

            </div>

        `;

    return;
  }

  elements.taskList.innerHTML = tasks.map(createTaskCard).join("");
}

function createTaskCard(task) {
  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "No Due Date";

  return `

        <article class="task-card">

            <div class="task-left">

                <button
                    class="task-check"
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

                            ${formattedDate}

                        </span>

                    </div>

                </div>

            </div>

            <div class="task-actions">

                <button
                    class="icon-btn"
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
   Start App
========================================== */

init();
