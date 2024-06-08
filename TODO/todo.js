let $todoInput;
let $alertInfo;
let $addBtn;
let $saveBtn;  // Added save button
let $ulList;
let $newTask;
let $allTasks;
let $idNumber = 0;
let $popup;
let $popupInfo;
let $editedTodo;
let $popupInput;
let $addPopupBtn;
let $closeTodoBtn;

const translations = {
    en: {
        emptyTask: 'Enter the task content.',
        duplicateTask: 'Task already exists.',
        noTasks: 'No tasks on the list.',
        emptyPopup: 'You must provide some content.',
        addBtn: 'Add',
        acceptBtn: 'Accept',
        cancelBtn: 'Cancel',
        saveBtn: 'Save Tasks'  // Added save button text
    },
    pl: {
        emptyTask: 'Wpisz treść zadania.',
        duplicateTask: 'Task już istnieje.',
        noTasks: 'Brak zadań na liście.',
        emptyPopup: 'Musisz podać jakąś treść.',
        addBtn: 'Dodaj',
        acceptBtn: 'Akceptuj',
        cancelBtn: 'Anuluj',
        saveBtn: 'Zapisz Zadania'  // Added save button text
    }
};

const getBrowserLanguage = () => {
    const lang = navigator.language || navigator.userLanguage;
    return lang.startsWith('pl') ? 'pl' : 'en';
}

const getSavedLanguage = () => {
    return localStorage.getItem('language') || getBrowserLanguage();
}

const translatePage = () => {
    $addBtn.textContent = translations[language].addBtn;
    $addPopupBtn.textContent = translations[language].acceptBtn;
    $closeTodoBtn.textContent = translations[language].cancelBtn;
    $saveBtn.textContent = translations[language].saveBtn;  // Translate save button
    if ($alertInfo.innerHTML) {
        switch ($alertInfo.innerHTML) {
            case 'Enter the task content.':
            case 'Wpisz treść zadania.':
                $alertInfo.innerHTML = translations[language].emptyTask;
                break;
            case 'Task already exists.':
            case 'Task już istnieje.':
                $alertInfo.innerHTML = translations[language].duplicateTask;
                break;
            case 'No tasks on the list.':
            case 'Brak zadań na liście.':
                $alertInfo.innerHTML = translations[language].noTasks;
                break;
            case 'You must provide some content.':
            case 'Musisz podać jakąś treść.':
                $alertInfo.innerHTML = translations[language].emptyPopup;
                break;
        }
    }
}

const setLanguage = (lang) => {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    language = lang;
    translatePage();
}

let language = getSavedLanguage();

const main = () => {
    prepareDOMElements();
    prepareDOMEvents();
    translatePage();
}

const prepareDOMElements = () => {
    $todoInput = document.querySelector('.todo-input');
    $alertInfo = document.querySelector('.alert-info');
    $addBtn = document.querySelector('.add-btn');
    $saveBtn = document.querySelector('.save-btn');  // Select save button
    $ulList = document.querySelector('.todo-list ul');
    $allTasks = document.getElementsByTagName('li');
    $popup = document.querySelector('.popup');
    $popupInfo = document.querySelector('.popup-info');
    $popupInput = document.querySelector('.popup-input');
    $addPopupBtn = document.querySelector('.accept');
    $closeTodoBtn = document.querySelector('.cancel');
}

const prepareDOMEvents = () => {
    $addBtn.addEventListener('click', addNewTask);
    $saveBtn.addEventListener('click', saveTasksToFile);  // Add event listener for save button
    $todoInput.addEventListener('keyup', enterCheck);
    $ulList.addEventListener('click', checkClick);
    $addPopupBtn.addEventListener('click', changeTodo);
    $closeTodoBtn.addEventListener('click', closePopup);
}

const addNewTask = () => {
    const taskText = $todoInput.value.trim();
    if (taskText !== '') {
        if (!isDuplicateTask(taskText)) {
            $idNumber++;
            $newTask = document.createElement('li');
            $newTask.innerText = taskText;
            $newTask.setAttribute('id', `todo-${$idNumber}`);
            $ulList.appendChild($newTask);

            $todoInput.value = '';
            $alertInfo.innerHTML = '';
            createToolsArea($newTask);
        } else {
            $alertInfo.innerHTML = translations[language].duplicateTask;
        }
    } else {
        $alertInfo.innerHTML = translations[language].emptyTask;
    }
}

const isDuplicateTask = (taskText) => {
    const tasks = Array.from($ulList.getElementsByTagName('li'));
    return tasks.some(task => task.firstChild.textContent === taskText);
}

const enterCheck = (event) => {
    if (event.key === 'Enter') {
        addNewTask();
    }
}

const createToolsArea = (taskElement) => {
    const toolsPanel = document.createElement('div')
    toolsPanel.classList.add('tools')
    taskElement.appendChild(toolsPanel)

    const completeBtn = document.createElement('button')
    completeBtn.classList.add('complete')
    completeBtn.innerHTML = '<i class="fas fa-check"></i>'

    const editBtn = document.createElement('button')
    editBtn.classList.add('edit')
    editBtn.innerHTML = '<i class="fas fa-pen"></i>'

    const deleteBtn = document.createElement('button')
    deleteBtn.classList.add('delete')
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>'

    toolsPanel.appendChild(completeBtn)
    toolsPanel.appendChild(editBtn)
    toolsPanel.appendChild(deleteBtn)
}

const checkClick = e => {
    if (e.target.classList.value !== '') {
        if (e.target.closest('button').classList.contains('complete')) {
            e.target.closest('li').classList.toggle('completed');
            e.target.closest('button').classList.toggle('completed');
        } else if (e.target.closest('button').classList.contains('edit')) {
            editTask(e);
        } else if (e.target.closest('button').classList.contains('delete')) {
            deleteTask(e);
        }
    }
}

const editTask = e => {
    const oldTodo = e.target.closest('li').id
    $editedTodo = document.getElementById(oldTodo)
    $popup.style.display = 'flex'
    $popupInput.value = $editedTodo.firstChild.textContent;
}

const changeTodo = () => {
    if ($popupInput.value !== '') {
        $editedTodo.firstChild.textContent = $popupInput.value;
        $popupInfo.innerText = '';
        $popup.style.display = 'none';
    } else {
        $popupInfo.innerText = translations[language].emptyPopup;
    }
}

const deleteTask = e => {
    const deleteTodo = e.target.closest('li');
    deleteTodo.remove();

    if ($ulList.children.length === 0) {
        $alertInfo.innerHTML = translations[language].noTasks;
    }

}

const closePopup = () => {
    $popup.style.display = 'none';
    $popupInfo.innerHTML = '';
}

const saveTasksToFile = () => {
    const tasks = Array.from($ulList.getElementsByTagName('li')).map(task => task.firstChild.textContent);
    const blob = new Blob([tasks.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.txt';
    a.click();
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', main);
