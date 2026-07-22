const tasks = [];

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

function init() {
  bindEvents();

  render();
}

function bindEvents() {
  elements.form.addEventListener("submit", handleAddTask);
}

function handleAddTask(event) {
  event.preventDefault();

  console.log("Task submitted");
}

function render() {
  console.log("Render UI");
}

init();
