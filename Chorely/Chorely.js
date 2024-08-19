let $todoInput;
let $alertInfo;
let $addBtn;
let $saveBtn; 
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
const saveButton = document.querySelector('.save-btn');
    const btnDisplay = saveButton.querySelector('.btn-display');
    const btnDisplayNone = saveButton.querySelector('.btn-displaynone');
    let timeoutId;
    let isHovered = false;

const translations = {
    en: {
        emptyTask: 'Enter the task content.',
        duplicateTask: 'Task already exists.',
        noTasks: 'No tasks on the list.',
        emptyPopup: 'You must provide some content.',
        addBtn: 'Add',
        acceptBtn: 'Accept',
        cancelBtn: 'Cancel',  
    },
    pl: {
        emptyTask: 'Wpisz treść zadania.',
        duplicateTask: 'Task już istnieje.',
        noTasks: 'Brak zadań na liście.',
        emptyPopup: 'Musisz podać jakąś treść.',
        addBtn: 'Dodaj',
        acceptBtn: 'Akceptuj',
        cancelBtn: 'Anuluj',
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
    $saveBtn = document.querySelector('.save-btn'); 
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
    $saveBtn.addEventListener('click', saveTasksToPDF);  
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
            $newTask.innerText = `${$idNumber}. ${taskText}`;
            $newTask.setAttribute('id', `todo-${$idNumber}`);
            $ulList.appendChild($newTask);

            $todoInput.value = '';
            $alertInfo.innerHTML = '';
            createToolsArea($newTask);
            updateTaskNumbers();
        } else {
            $alertInfo.innerHTML = translations[language].duplicateTask;
        }
    } else {
        $alertInfo.innerHTML = translations[language].emptyTask;
    }
}

const isDuplicateTask = (taskText) => {
    const tasks = Array.from($ulList.getElementsByTagName('li'));
    return tasks.some(task => task.firstChild.textContent.endsWith(taskText));
}

const enterCheck = (event) => {
    if (event.key === 'Enter') {
        addNewTask();
    }
}

const createToolsArea = (taskElement) => {
    const toolsPanel = document.createElement('div');
    toolsPanel.classList.add('tools');
    taskElement.appendChild(toolsPanel);

    const taskText = document.createElement('div');
    taskText.classList.add('task-text');
    taskText.textContent = taskElement.textContent;
    taskElement.textContent = '';
    taskElement.appendChild(taskText);
    taskElement.appendChild(toolsPanel)

    const completeBtn = document.createElement('button');
    completeBtn.classList.add('complete');
    completeBtn.innerHTML = '<i class="fas fa-check"></i>';

    const editBtn = document.createElement('button');
    editBtn.classList.add('edit');
    editBtn.innerHTML = '<i class="fas fa-pen"></i>';

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete');
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';

    toolsPanel.appendChild(completeBtn);
    toolsPanel.appendChild(editBtn);
    toolsPanel.appendChild(deleteBtn);
};


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
    $popupInput.value = $editedTodo.firstChild.textContent.split('. ')[1];
}

const changeTodo = () => {
    if ($popupInput.value !== '') {
        $editedTodo.firstChild.textContent = `${$editedTodo.id.split('-')[1]}. ${$popupInput.value}`;
        $popupInfo.innerText = '';
        $popup.style.display = 'none';
        updateTaskNumbers();
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

    updateTaskNumbers();
}

const closePopup = () => {
    $popup.style.display = 'none';
    $popupInfo.innerHTML = '';
}

const updateTaskNumbers = () => {
    const tasks = Array.from($ulList.getElementsByTagName('li'));
    tasks.forEach((task, index) => {
        task.firstChild.textContent = `${index + 1}. ${task.firstChild.textContent.split('. ')[1]}`;
    });
}

function showHoverState() {
        btnDisplay.style.display = 'none';
        btnDisplayNone.style.display = 'inline';
    }

    function showNormalState() {
        btnDisplay.style.display = 'inline';
        btnDisplayNone.style.display = 'none';
    }

    saveButton.addEventListener('mouseenter', function() {
        isHovered = true;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            if (isHovered) {
                showHoverState();
            }
        }, 100);
    });

    saveButton.addEventListener('mouseleave', function() {
        isHovered = false;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            if (!isHovered) {
                showNormalState();
            }
        }, 300); 
    });

const saveTasksToPDF = () => {
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

    
    ctx.globalAlpha = 0.45;

   
    const logoWidth = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) * 0.7;
    const logoHeight = 180 * scale * 0.7;
    const startX = (canvas.width - logoWidth) / 2;
    const startY = (canvas.height - logoHeight) / 2;

   
    const gradient = ctx.createLinearGradient(startX, startY, startX + logoWidth, startY + logoHeight);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(startX, startY, logoWidth, logoHeight);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    
    const iconSize = 80 * scale * 0.7;
    const iconOffsetX = iconSize * 0.9; 
    const iconGradient = ctx.createRadialGradient(
        centerX - iconOffsetX, centerY, 0,
        centerX - iconOffsetX, centerY, iconSize / 2
    );
    iconGradient.addColorStop(0, 'rgba(9, 161, 249, 0.3)');
    iconGradient.addColorStop(1, 'rgba(9, 161, 249, 0.2)');
    
    ctx.beginPath();
    ctx.arc(centerX - iconOffsetX, centerY, iconSize / 2, 0, 2 * Math.PI);
    ctx.fillStyle = iconGradient;
    ctx.fill();

   
    ctx.font = `bold ${40 * scale * 0.7}px "Font Awesome 5 Free"`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uf00c', centerX - iconOffsetX, centerY);

    
    const textOffsetX = iconSize * 0.7; 
    ctx.font = `bold ${32 * scale * 0.7}px Arial`;
    
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10 * scale * 0.7;
    ctx.shadowOffsetX = 2 * scale * 0.7;
    ctx.shadowOffsetY = 2 * scale * 0.7;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('CHORELY', centerX + textOffsetX, centerY);

    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    
    const doc = new jsPDF();

    
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    
    const tasks = Array.from($ulList.getElementsByTagName('li')).map(task => task.firstChild.textContent);

    doc.setFontSize(12);

    const taskData = tasks.map(task => [task]); 

    doc.autoTable({
        head: [['Zadania/Tasks:']],
        body: taskData,
        startY: 20,
        margin: { left: 10, right: 10 },
        styles: { overflow: 'linebreak' },
        theme: 'grid',
        headStyles: { fillColor: [9, 161, 249], textColor: 255 },
        bodyStyles: { textColor: 0 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    doc.save('tasks.pdf');
}



document.addEventListener('DOMContentLoaded', main);
