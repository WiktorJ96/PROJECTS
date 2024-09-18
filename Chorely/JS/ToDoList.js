export class TodoError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

export class TodoList {
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