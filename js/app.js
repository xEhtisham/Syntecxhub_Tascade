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
  time: document.querySelector("#task-time"),

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

  populateDateDropdowns();

  bindEvents();

  render();

  initCustomSelects();

  initFullBoxPickers();
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

    dueTime: elements.time ? elements.time.value : "",

    completed: false,

    createdAt: new Date().toISOString(),
  };

  tasks.unshift(task);

  saveTasks();

  render();

  elements.form.reset();
  resetCustomSelects(elements.form);

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
  const priorityClass = task.priority ? task.priority.toLowerCase() : "low";

  return `

        <article class="task-card priority-${priorityClass} ${task.completed ? "completed" : ""}">

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

                        <span class="task-badge priority ${priorityClass}">

                            <i class="fa-solid fa-circle priority-dot"></i>

                            ${task.priority}

                        </span>

                        <span class="task-date">

                            <i class="fa-regular fa-clock"></i>

                            ${formatDate(task.dueDate, task.dueTime)}

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

function formatTime(timeStr) {
  if (!timeStr) return "";

  if (timeStr.includes("AM") || timeStr.includes("PM")) {
    return timeStr.replace(/^0/, "").trim();
  }

  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].trim();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function formatDate(dateStr, timeStr) {
  if (!dateStr && !timeStr) {
    return "No Due Date";
  }

  let result = "";
  if (dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    if (!isNaN(d.getTime())) {
      result = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }

  if (timeStr) {
    const formattedTime = formatTime(timeStr);
    if (formattedTime) {
      result = result ? `${result} at ${formattedTime}` : formattedTime;
    }
  }

  return result || "No Due Date";
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
   Custom Dropdowns & Pickers
========================================== */

function getOptionContent(selectId, value, text) {
  let icon = "";
  if (value === "Personal") icon = '<i class="fa-solid fa-user" style="color:#C58B4E; margin-right:6px;"></i>';
  else if (value === "Work") icon = '<i class="fa-solid fa-briefcase" style="color:#C58B4E; margin-right:6px;"></i>';
  else if (value === "Study") icon = '<i class="fa-solid fa-graduation-cap" style="color:#C58B4E; margin-right:6px;"></i>';
  else if (value === "Low" || value === "Low Priority") icon = '<i class="fa-solid fa-circle" style="color:#4FA36A; font-size:10px; margin-right:6px;"></i>';
  else if (value === "Medium" || value === "Medium Priority") icon = '<i class="fa-solid fa-circle" style="color:#C58B4E; font-size:10px; margin-right:6px;"></i>';
  else if (value === "High" || value === "High Priority") icon = '<i class="fa-solid fa-circle" style="color:#C85B5B; font-size:10px; margin-right:6px;"></i>';
  else if (selectId.includes("time")) icon = '<i class="fa-regular fa-clock" style="color:#C58B4E; margin-right:6px;"></i>';
  else if (selectId.includes("date")) icon = '<i class="fa-regular fa-calendar" style="color:#C58B4E; margin-right:6px;"></i>';

  return `<span>${icon} ${text}</span>`;
}

function initCustomSelects() {
  document.querySelectorAll("select.input-field").forEach((select) => {
    if (select.dataset.customInitialized) return;
    select.dataset.customInitialized = "true";
    select.style.display = "none";

    const container = document.createElement("div");
    container.className = "custom-select-container";

    const trigger = document.createElement("div");
    trigger.className = "custom-select-trigger";

    const triggerText = document.createElement("span");
    triggerText.className = "trigger-content";
    const selectedOption = select.options[select.selectedIndex] || select.options[0];
    triggerText.innerHTML = getOptionContent(select.id, selectedOption.value, selectedOption.text);

    const chevron = document.createElement("i");
    chevron.className = "fa-solid fa-chevron-down chevron";

    trigger.appendChild(triggerText);
    trigger.appendChild(chevron);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "custom-select-options";

    Array.from(select.options).forEach((opt) => {
      const optDiv = document.createElement("div");
      optDiv.className = `custom-option ${opt.selected ? "selected" : ""}`;
      optDiv.dataset.value = opt.value;
      optDiv.innerHTML = getOptionContent(select.id, opt.value, opt.text);

      optDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        select.value = opt.value;
        select.dispatchEvent(new Event("change"));

        optionsContainer.querySelectorAll(".custom-option").forEach((o) => o.classList.remove("selected"));
        optDiv.classList.add("selected");
        triggerText.innerHTML = getOptionContent(select.id, opt.value, opt.text);
        container.classList.remove("open");
      });

      optionsContainer.appendChild(optDiv);
    });

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".custom-select-container").forEach((c) => {
        if (c !== container) c.classList.remove("open");
      });
      const isOpen = container.classList.toggle("open");
      if (isOpen) {
        const selected = optionsContainer.querySelector(".custom-option.selected");
        if (selected) {
          selected.scrollIntoView({ block: "nearest" });
        }
      }
    });

    container.appendChild(trigger);
    container.appendChild(optionsContainer);
    select.parentNode.insertBefore(container, select);

    select.addEventListener("change", () => {
      const opt = select.options[select.selectedIndex];
      if (opt) {
        triggerText.innerHTML = getOptionContent(select.id, opt.value, opt.text);
        optionsContainer.querySelectorAll(".custom-option").forEach((o) => {
          o.classList.toggle("selected", o.dataset.value === opt.value);
        });
      }
    });
  });

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("reset", () => {
      setTimeout(() => {
        resetCustomSelects(form);
      }, 0);
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-select-container").forEach((c) => c.classList.remove("open"));
  });
}

function resetCustomSelects(form) {
  if (!form) return;
  form.querySelectorAll("select.input-field").forEach((select) => {
    select.selectedIndex = 0;
    select.dispatchEvent(new Event("change"));
  });
}

function populateDateDropdowns() {
  const dateSelects = [document.querySelector("#task-date"), document.querySelector("#edit-date")];
  const today = new Date();

  dateSelects.forEach((select) => {
    if (!select) return;
    select.innerHTML = '<option value="">Select Date</option>';

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const isoDate = `${year}-${month}-${day}`;

      let label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      if (i === 0) {
        label = `Today (${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
      } else if (i === 1) {
        label = `Tomorrow (${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
      }

      const opt = document.createElement("option");
      opt.value = isoDate;
      opt.textContent = label;
      select.appendChild(opt);
    }
  });
}

function initFullBoxPickers() {
  document.querySelectorAll('input[type="date"], input[type="time"]').forEach((input) => {
    input.addEventListener("click", () => {
      try {
        if (typeof input.showPicker === "function") {
          input.showPicker();
        }
      } catch (err) {}
    });
  });
}

/* ==========================================
   Start Application
========================================== */

init();
