export class TodoListUI {
  constructor(todoList) {
    this.todoList = todoList;
    this.todoInput = document.querySelector(".todo-input");
    this.alertInfo = document.querySelector(".alert-info");
    this.addBtn = document.querySelector(".add-btn");
    this.ulList = document.querySelector(".todo-list ul");
    this.saveBtn = document.querySelector(".save-btn");
    this.popup = document.querySelector(".popup");
    this.popupInfo = document.querySelector(".popup-info");
    this.popupInput = document.querySelector(".popup-input");
    this.addPopupBtn = document.querySelector(".accept");
    this.closeTodoBtn = document.querySelector(".cancel");

    this.editedTodo = null;

    this.bindEvents();
    this.renderTasks();
  }

  bindEvents() {
    this.addBtn.addEventListener("click", () => this.addNewTask());
    this.todoInput.addEventListener("keyup", (e) => this.enterCheck(e));
    this.ulList.addEventListener("click", (e) => this.checkClick(e));
    this.addPopupBtn.addEventListener("click", () => this.changeTodo());
    this.closeTodoBtn.addEventListener("click", () => this.closePopup());
    this.saveBtn.addEventListener("click", () => this.saveTasksToPDF());
  }

  renderTasks() {
    this.ulList.innerHTML = "";
    const tasks = this.todoList.getAllTasks();
    tasks.forEach((task) => this.createTaskElement(task));

    if (tasks.length === 0) {
      this.alertInfo.setAttribute("data-lang-key", "alertInfoNoTasks");
      this.alertInfo.textContent = "";
    } else {
      this.alertInfo.removeAttribute("data-lang-key");
      this.alertInfo.textContent = "";
    }
  }

  addNewTask() {
    const taskText = this.todoInput.value;
    try {
      const newTask = this.todoList.addNewTask(taskText);
      this.createTaskElement(newTask);
      this.todoInput.value = "";

      this.alertInfo.removeAttribute("data-lang-key");
      this.alertInfo.textContent = "";
    } catch (error) {
      if (error.code === "EMPTY_TASK") {

        this.alertInfo.setAttribute("data-lang-key", "emptyTaskError");
        this.alertInfo.textContent = "";
      } else if (error.code === "DUPLICATE_TASK") {
        this.alertInfo.setAttribute("data-lang-key", "duplicateTaskError");
        this.alertInfo.textContent = "";
      } else {
        this.alertInfo.setAttribute("data-lang-key", "taskAddError");
        this.alertInfo.textContent = "";
      }
    }
  }

  createTaskElement(task) {
    const newTask = document.createElement("li");
    newTask.setAttribute("id", `todo-${task.id}`);
    newTask.innerHTML = `
      <div class="task-text">${task.id}. ${DOMPurify.sanitize(task.text)}</div>
      <div class="tools">
          <button class="complete"><i class="fas fa-check"></i></button>
          <button class="edit"><i class="fas fa-pen"></i></button>
          <button class="delete"><i class="fas fa-times"></i></button>
      </div>
    `;
    if (task.completed) {
      newTask.classList.add("completed");
      newTask.querySelector(".complete").classList.add("completed");
    }
    this.ulList.appendChild(newTask);
    this.updateTaskNumbers();
  }

  enterCheck(e) {
    if (e.key === "Enter") {
      this.addNewTask();
    }
  }

  checkClick(e) {
    if (e.target.closest("button")) {
      const taskElement = e.target.closest("li");
      const taskId = parseInt(taskElement.id.split("-")[1]);

      if (e.target.closest("button").classList.contains("complete")) {
        this.toggleCompleteTask(taskId, taskElement);
      } else if (e.target.closest("button").classList.contains("edit")) {
        this.editTask(taskId, taskElement);
      } else if (e.target.closest("button").classList.contains("delete")) {
        this.deleteTask(taskId, taskElement);
      }
    }
  }

  toggleCompleteTask(taskId, taskElement) {
    const updatedTask = this.todoList.completeTask(taskId);
    if (updatedTask) {
      taskElement.classList.toggle("completed");
      const completeButton = taskElement.querySelector(".complete");
      if (completeButton) {
        completeButton.classList.toggle("completed");
      }
      this.updateTaskAppearance(taskElement, updatedTask);
      this.updateTaskNumbers();
    }
  }

  updateTaskAppearance(taskElement, task) {
    const taskTextElement = taskElement.querySelector(".task-text");
    if (taskTextElement) {
      taskTextElement.textContent = `${task.id}. ${DOMPurify.sanitize(task.text)}`;
      taskTextElement.style.textDecoration = task.completed
        ? "line-through"
        : "none";
    }
    this.updateTaskNumbers();
  }

  editTask(taskId, taskElement) {
    const task = this.todoList.getAllTasks().find((t) => t.id === taskId);
    if (task) {
      this.editedTodo = taskElement;
      this.popup.style.display = "flex";
      this.popupInput.value = task.text;
    }
  }

  changeTodo() {
    if (this.popupInput.value !== "") {
      const taskId = parseInt(this.editedTodo.id.split("-")[1]);
      try {
        const updatedTask = this.todoList.editTask(
          taskId,
          this.popupInput.value
        );
        if (updatedTask) {
          this.updateTaskAppearance(this.editedTodo, updatedTask);
          this.closePopup();
          this.updateTaskNumbers();
        }
      } catch (error) {
        if (error.code === "DUPLICATE_TASK") {
          this.popupInfo.setAttribute(
            "data-lang-key",
            "taskEditDuplicateError"
          );
          this.popupInfo.textContent = "";
        } else {
          this.popupInfo.setAttribute("data-lang-key", "taskEditError");
          this.popupInfo.textContent = "";
        }
      }
    } else {
      this.popupInfo.setAttribute("data-lang-key", "emptyTaskEdit");
      this.popupInfo.textContent = "";
    }
  }

  deleteTask(taskId, taskElement) {
    const deletedTask = this.todoList.deleteTask(taskId);
    if (deletedTask) {
      taskElement.remove();
      this.updateTaskNumbers();
    }
    if (this.todoList.getAllTasks().length === 0) {
      window.location.reload();
    }
  }

  closePopup() {
    this.popup.style.display = "none";
    this.popupInfo.removeAttribute("data-lang-key");
    this.popupInfo.textContent = "";
  }

  updateTaskNumbers() {
    const tasks = this.todoList.getAllTasks();
    tasks.forEach((task, index) => {
      const taskElement = document.getElementById(`todo-${task.id}`);
      if (taskElement) {
        const taskTextElement = taskElement.querySelector(".task-text");
        if (taskTextElement) {
          taskTextElement.textContent = `${index + 1}. ${DOMPurify.sanitize(task.text)}`;
          taskTextElement.style.textDecoration = task.completed
            ? "line-through"
            : "none";
        }
      }
    });
  }
}
