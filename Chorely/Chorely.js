class TodoError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

class TodoList {
    constructor() {
        this.tasks = this.loadTasksFromStorage();
        this.idNumber = this.tasks.length > 0 ? Math.max(...this.tasks.map(task => task.id)) : 0;
    }

    sanitizeInput(input) {
        return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }

    isDuplicateTask(taskText) {
        return this.tasks.some(task => task.text === taskText);
    }

    addNewTask(taskText) {
        try {
            taskText = this.sanitizeInput(taskText.trim());
            if (taskText === '') {
                throw new TodoError('Task text cannot be empty', 'EMPTY_TASK');
            }
            if (this.isDuplicateTask(taskText)) {
                throw new TodoError('Task already exists', 'DUPLICATE_TASK');
            }
            this.idNumber++;
            const newTask = {
                id: this.idNumber,
                text: taskText,
                completed: false
            };
            this.tasks.push(newTask);
            this.saveTasksToStorage();
            return newTask;
        } catch (error) {
            console.error('Błąd podczas dodawania zadania:', error);
            throw error;
        }
    }

    saveTasksToStorage() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Błąd podczas zapisywania zadań do localStorage:', error);
        }
    }

    loadTasksFromStorage() {
        try {
            const savedTasks = localStorage.getItem('tasks');
            if (!savedTasks) return [];

            const parsedTasks = JSON.parse(savedTasks);
            if (!Array.isArray(parsedTasks)) {
                console.warn('Zapisane zadania nie są w oczekiwanym formacie. Resetowanie...');
                return [];
            }

            return parsedTasks.filter(task => 
                typeof task === 'object' &&
                typeof task.id === 'number' &&
                typeof task.text === 'string' &&
                typeof task.completed === 'boolean'
            );
        } catch (error) {
            console.error('Błąd podczas wczytywania zadań z localStorage:', error);
            return [];
        }
    }

    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasksToStorage();  
            return task;
        }
        console.warn('Nie znaleziono zadania o id:', taskId);
        return null;
    }

    editTask(taskId, newText) {
        try {
            newText = this.sanitizeInput(newText.trim());
            if (newText === '') {
                throw new TodoError('Task text cannot be empty', 'EMPTY_TASK');
            }
            if (this.isDuplicateTask(newText)) {
                throw new TodoError('Task already exists', 'DUPLICATE_TASK');
            }
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.text = newText;
                this.saveTasksToStorage();
                return task;
            }
            console.warn('Nie znaleziono zadania o id:', taskId);
            return null;
        } catch (error) {
            console.error('Błąd podczas edycji zadania:', error);
            throw error;
        }
    }

    deleteTask(taskId) {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            const deletedTask = this.tasks.splice(index, 1)[0];
            this.saveTasksToStorage();  
            return deletedTask;
        }
        console.warn('Nie znaleziono zadania do usunięcia o id:', taskId);
        return null;
    }

    getAllTasks() {
        return [...this.tasks];
    }
}

class TodoListUI {
    constructor(todoList) {
        this.todoList = todoList;
        this.todoInput = document.querySelector('.todo-input');
        this.alertInfo = document.querySelector('.alert-info');
        this.addBtn = document.querySelector('.add-btn');
        this.ulList = document.querySelector('.todo-list ul');
        this.saveBtn = document.querySelector('.save-btn');
        this.popup = document.querySelector('.popup');
        this.popupInfo = document.querySelector('.popup-info');
        this.popupInput = document.querySelector('.popup-input');
        this.addPopupBtn = document.querySelector('.accept');
        this.closeTodoBtn = document.querySelector('.cancel');
        this.installButton = document.querySelector('.installButton');
        
        this.editedTodo = null;
        this.deferredPrompt = null;

        this.bindEvents();
        this.renderTasks();
        this.setupPWA();
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addNewTask());
        this.todoInput.addEventListener('keyup', (e) => this.enterCheck(e));
        this.ulList.addEventListener('click', (e) => this.checkClick(e));
        this.addPopupBtn.addEventListener('click', () => this.changeTodo());
        this.closeTodoBtn.addEventListener('click', () => this.closePopup());
        this.saveBtn.addEventListener('click', () => this.saveTasksToPDF());
        if (this.installButton) {
            this.installButton.addEventListener('click', () => this.installPWA());
        }
    }

    setupPWA() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.hideInstallButton();
            return;
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        if (
            navigator.standalone === false &&
            /iPhone|iPad|iPod/.test(navigator.userAgent)
        ) {
            this.showIOSInstallInstructions();
        }
    }

    showInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'block';
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
        }
    }

    showIOSInstallInstructions() {
        const iosInstructions = document.createElement('div');
        iosInstructions.innerHTML = `
            <p>Aby zainstalować tę aplikację na iOS:</p>
            <ol>
                <li>Dotknij ikony "Udostępnij" w przeglądarce</li>
                <li>Wybierz "Dodaj do ekranu głównego"</li>
            </ol>
        `;
        document.body.appendChild(iosInstructions);
    }

    installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    this.hideInstallButton();
                }
                this.deferredPrompt = null;
            });
        } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            alert('Aby zainstalować aplikację, użyj opcji "Dodaj do ekranu głównego" w menu udostępniania przeglądarki.');
        }
    }

    renderTasks() {
        this.ulList.innerHTML = '';
        const tasks = this.todoList.getAllTasks();
        tasks.forEach(task => this.createTaskElement(task));
        if (tasks.length === 0) {
            this.alertInfo.textContent = 'Brak zadań na liście.';
        } else {
            this.alertInfo.textContent = '';
        }
    }

    addNewTask() {
        const taskText = this.todoInput.value;
        try {
            const newTask = this.todoList.addNewTask(taskText);
            this.createTaskElement(newTask);
            this.todoInput.value = '';
            this.alertInfo.textContent = '';
        } catch (error) {
            if (error.code === 'EMPTY_TASK') {
                this.alertInfo.textContent = 'Wprowadź treść zadania.';
            } else if (error.code === 'DUPLICATE_TASK') {
                this.alertInfo.textContent = 'Takie zadanie już istnieje.';
            } else {
                this.alertInfo.textContent = 'Wystąpił błąd podczas dodawania zadania.';
            }
        }
    }

    createTaskElement(task) {
        const newTask = document.createElement('li');
        newTask.setAttribute('id', `todo-${task.id}`);
        newTask.innerHTML = `
            <div class="task-text">${task.id}. ${DOMPurify.sanitize(task.text)}</div>
            <div class="tools">
                <button class="complete"><i class="fas fa-check"></i></button>
                <button class="edit"><i class="fas fa-pen"></i></button>
                <button class="delete"><i class="fas fa-times"></i></button>
            </div>
        `;
        if (task.completed) {
            newTask.classList.add('completed');
            newTask.querySelector('.complete').classList.add('completed');
        }
        this.ulList.appendChild(newTask);
        this.updateTaskNumbers();
    }

    enterCheck(e) {
        if (e.key === 'Enter') {
            this.addNewTask();
        }
    }

    checkClick(e) {
        if (e.target.closest('button')) {
            const taskElement = e.target.closest('li');
            const taskId = parseInt(taskElement.id.split('-')[1]);
            
            if (e.target.closest('button').classList.contains('complete')) {
                this.toggleCompleteTask(taskId, taskElement);
            } else if (e.target.closest('button').classList.contains('edit')) {
                this.editTask(taskId, taskElement);
            } else if (e.target.closest('button').classList.contains('delete')) {
                this.deleteTask(taskId, taskElement);
            }
        }
    }

    toggleCompleteTask(taskId, taskElement) {
        const updatedTask = this.todoList.completeTask(taskId);
        if (updatedTask) {
            taskElement.classList.toggle('completed');
            const completeButton = taskElement.querySelector('.complete');
            if (completeButton) {
                completeButton.classList.toggle('completed');
            }
            this.updateTaskAppearance(taskElement, updatedTask);
            this.updateTaskNumbers();
        }
    }

    updateTaskAppearance(taskElement, task) {
        const taskTextElement = taskElement.querySelector('.task-text');
        if (taskTextElement) {
            taskTextElement.textContent = `${task.id}. ${DOMPurify.sanitize(task.text)}`;
            taskTextElement.style.textDecoration = task.completed ? 'line-through' : 'none';
        }
        this.updateTaskNumbers();
    }

    editTask(taskId, taskElement) {
        const task = this.todoList.getAllTasks().find(t => t.id === taskId);
        if (task) {
            this.editedTodo = taskElement;
            this.popup.style.display = 'flex';
            this.popupInput.value = task.text;
        }
    }

    changeTodo() {
        if (this.popupInput.value !== '') {
            const taskId = parseInt(this.editedTodo.id.split('-')[1]);
            try {
                const updatedTask = this.todoList.editTask(taskId, this.popupInput.value);
                if (updatedTask) {
                    this.updateTaskAppearance(this.editedTodo, updatedTask);
                    this.closePopup();
                    this.updateTaskNumbers();
                }
            } catch (error) {
                if (error.code === 'DUPLICATE_TASK') {
                    this.popupInfo.textContent = 'Takie zadanie już istnieje.';
                } else {
                    this.popupInfo.textContent = 'Wystąpił błąd podczas edycji zadania.';
                }
            }
        } else {
            this.popupInfo.textContent = 'Musisz podać jakąś treść zadania.';
        }
    }

    deleteTask(taskId, taskElement) {
        const deletedTask = this.todoList.deleteTask(taskId);
        if (deletedTask) {
            taskElement.remove();
            this.updateTaskNumbers();
        }
        if (this.todoList.getAllTasks().length === 0) {
            this.alertInfo.textContent = 'Brak zadań na liście.';
        }
    }

    closePopup() {
        this.popup.style.display = 'none';
        this.popupInfo.textContent = '';
    }

    updateTaskNumbers() {
        const tasks = this.todoList.getAllTasks();
        tasks.forEach((task, index) => {
            const taskElement = document.getElementById(`todo-${task.id}`);
            if (taskElement) {
                const taskTextElement = taskElement.querySelector('.task-text');
                if (taskTextElement) {
                    taskTextElement.textContent = `${index + 1}. ${DOMPurify.sanitize(task.text)}`;
                    taskTextElement.style.textDecoration = task.completed ? 'line-through' : 'none';
                }
            }
        });
    }

    saveTasksToPDF() {
    const { jsPDF } = window.jspdf;

    const canvas = document.createElement('canvas');
    const pdfWidth = 210;  
    const pdfHeight = 297; 
    const scale = 10;      
    canvas.width = pdfWidth * scale;
    canvas.height = pdfHeight * scale;
    const ctx = canvas.getContext('2d');

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 4);  
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    const logoWidth = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) * 0.7;
    const logoHeight = 180 * scale * 0.7;
    const startX = (canvas.width - logoWidth) / 2;
    const startY = (canvas.height - logoHeight) / 2;

    const logoGradient = ctx.createLinearGradient(startX, startY, startX + logoWidth, startY + logoHeight);
    logoGradient.addColorStop(0, 'rgba(135, 206, 250, 0.2)');  
    logoGradient.addColorStop(1, 'rgba(70, 130, 180, 0.3)');   
    ctx.fillStyle = logoGradient;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY + 30 * scale);
    ctx.lineTo(startX, startY + logoHeight - 30 * scale);
    ctx.quadraticCurveTo(startX, startY + logoHeight, startX + 30 * scale, startY + logoHeight);
    ctx.lineTo(startX + logoWidth - 30 * scale, startY + logoHeight);
    ctx.quadraticCurveTo(startX + logoWidth, startY + logoHeight, startX + logoWidth, startY + logoHeight - 30 * scale);
    ctx.lineTo(startX + logoWidth, startY + 30 * scale);
    ctx.quadraticCurveTo(startX + logoWidth, startY, startX + logoWidth - 30 * scale, startY);
    ctx.lineTo(startX + 30 * scale, startY);
    ctx.quadraticCurveTo(startX, startY, startX, startY + 30 * scale);
    ctx.fill();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const iconSize = 80 * scale * 0.7;
    const iconOffsetX = iconSize * 0.9; 
    const iconGradient = ctx.createRadialGradient(
        centerX - iconOffsetX, centerY, 0,
        centerX - iconOffsetX, centerY, iconSize / 2
    );
    iconGradient.addColorStop(0, 'rgba(30, 144, 255, 0.8)'); 
    iconGradient.addColorStop(1, 'rgba(0, 191, 255, 0.6)');   
    
    ctx.beginPath();
    ctx.arc(centerX - iconOffsetX, centerY, iconSize / 2, 0, 2 * Math.PI);
    ctx.fillStyle = iconGradient;
    ctx.fill();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10 * scale * 0.7;
    ctx.shadowOffsetX = 3 * scale * 0.7;
    ctx.shadowOffsetY = 3 * scale * 0.7;

    ctx.font = `bold ${40 * scale * 0.7}px "Font Awesome 5 Free"`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uf00c', centerX - iconOffsetX, centerY);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 5 * scale * 0.7;
    ctx.shadowOffsetX = 2 * scale * 0.7;
    ctx.shadowOffsetY = 2 * scale * 0.7;

    const textOffsetX = iconSize * 0.7; 
    ctx.font = `bold ${32 * scale * 0.7}px Arial`;
    
    const textGradient = ctx.createLinearGradient(
        centerX + textOffsetX - 50 * scale * 0.7, centerY,
        centerX + textOffsetX + 50 * scale * 0.7, centerY
    );
    textGradient.addColorStop(0, 'rgba(25, 25, 112, 0.9)');
    textGradient.addColorStop(1, 'rgba(70, 130, 180, 0.9)'); 
    
    ctx.fillStyle = textGradient;
    ctx.fillText('CHORELY', centerX + textOffsetX, centerY);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1 * scale * 0.7;
    ctx.strokeText('CHORELY', centerX + textOffsetX, centerY);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const doc = new jsPDF();

    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    const tasks = this.todoList.getAllTasks().map(task => ({
        text: task.text,
        completed: task.completed
    }));

    doc.setFontSize(12);

    doc.autoTable({
        head: [['Zadania/Tasks:']],
        body: tasks.map(task => [
            {
                content: task.text,
                styles: {
                    textDecoration: task.completed ? 'line-through' : 'none',
                    textColor: task.completed ? [255, 0, 0] : [0, 0, 0]
                }
            }
        ]),
        startY: 20,
        margin: { left: 10, right: 10 },
        styles: { overflow: 'linebreak' },
        theme: 'grid',
        headStyles: { fillColor: [30, 144, 255], textColor: 255 },  
        alternateRowStyles: { fillColor: [240, 248, 255] },  
        didDrawCell: function(data) {
            if (data.section === 'body' && tasks[data.row.index].completed) {
                const { x, y, width, height } = data.cell;
                doc.setDrawColor(255, 0, 0);  
                doc.line(x, y + height / 2, x + width, y + height / 2);
            }
        }
    });

    doc.save('tasks.pdf');
}


}

window.addEventListener('appinstalled', (evt) => {
});

window.addEventListener('storage', function(e) {
});

document.addEventListener('DOMContentLoaded', () => {
    const todoList = new TodoList();
    window.todoListUI = new TodoListUI(todoList);
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .catch(error => {
                console.error('Błąd podczas rejestracji Service Worker:', error);
            });
    });
}


