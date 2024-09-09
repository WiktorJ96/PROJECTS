class NoteError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'NoteError';
        this.code = code;
    }
}

const addBtn = document.querySelector('.add');
const saveBtn = document.querySelector('.save');
const cancelBtn = document.querySelector('.cancel');
const deleteAllBtn = document.querySelector('.delete-all');
const noteArea = document.querySelector('.note-area');
const notePanel = document.querySelector('.note-panel');
const titleInput = document.querySelector('#title');
const categorySelect = document.querySelector('#category');
const colorPicker = document.querySelector('#color-picker');
const error = document.querySelector('.error');
const searchInput = document.querySelector('#search');
const categoryFilter = document.querySelector('#category-filter');

const quill = new Quill('#editor', {
    theme: 'snow'
});

const confirmModal = document.getElementById('confirm-modal');
const confirmYesBtn = document.getElementById('confirm-yes');
const confirmNoBtn = document.getElementById('confirm-no');

const confirmAllModal = document.getElementById('confirm-all-modal');
const confirmAllYesBtn = document.getElementById('confirm-all-yes');
const confirmAllNoBtn = document.getElementById('confirm-all-no');

let selectedColor = null;
let isEditing = false;
let editingNoteId = null;
let noteToDelete = null;


const showError = (message) => {
    error.textContent = message;
    error.style.visibility = 'visible';
    setTimeout(() => {
        error.style.visibility = 'hidden';
    }, 3000);
}

const openPanel = () => {
    notePanel.style.display = 'flex';
}

const closePanel = () => {
    notePanel.style.display = 'none';
    titleInput.value = '';
    quill.setText('');
    error.style.visibility = 'hidden';
    selectedColor = null;
    const colorOptions = colorPicker.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.classList.remove('selected'));
    isEditing = false;
    editingNoteId = null;
}

const loadNotes = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/notes');
        if (!response.ok) {
            throw new NoteError('Nie udało się załadować notatek', 'LOAD_NOTES_ERROR');
        }
        const notes = await response.json();
        noteArea.innerHTML = '';
        notes.forEach(note => {
            createNoteElement(note);
        });
    } catch (error) {
        if (error instanceof NoteError) {
            showError(error.message);
        } else {
            showError('Wystąpił nieznany błąd podczas ładowania notatek');
        }
    }
}

const createNoteElement = (note) => {
    const noteElement = document.createElement('div');
    noteElement.classList.add('note');
    noteElement.setAttribute('id', note.id);
    noteElement.innerHTML = `
        <div class="note-header">
            <h3 class="note-title">${note.title}</h3>
            <button class="edit-note" onclick="editNoteHandler('${note.id}')"><i class="fas fa-edit icon"></i></button>
            <button class="delete-note" onclick="deleteNoteHandler('${note.id}')"><i class="fas fa-times icon"></i></button>
        </div>
        <div class="note-body">${note.content}</div>
        <div class="note-category"><span>${note.category}</span></div>
    `;
    noteElement.dataset.category = note.category;
    noteElement.dataset.color = note.color;
    setNoteColor(noteElement, note.color);
    noteArea.appendChild(noteElement);
}

const addNote = async () => {
    try {
        if (titleInput.value !== '' && quill.root.innerHTML.trim() !== '<p><br></p>' && selectedColor && categorySelect.value !== '') {
            const note = {
                id: isEditing ? editingNoteId : Date.now().toString(),
                title: titleInput.value,
                content: quill.root.innerHTML,
                category: categorySelect.value,
                color: selectedColor
            };

            const url = isEditing ? `http://localhost:3000/api/notes/${editingNoteId}` : 'http://localhost:3000/api/notes';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note),
            });

            if (!response.ok) {
                throw new NoteError('Nie udało się zapisać notatki', 'SAVE_NOTE_ERROR');
            }

            closePanel();
            loadNotes();
        } else {
            throw new NoteError('Uzupełnij wszystkie pola!', 'VALIDATION_ERROR');
        }
    } catch (error) {
        if (error instanceof NoteError) {
            showError(error.message);
        } else {
            showError('Wystąpił nieznany błąd podczas zapisywania notatki');
        }
    }
}

const editNoteHandler = async (id) => {
    try {
        const response = await fetch(`http://localhost:3000/api/notes/${id}`);
        if (!response.ok) {
            throw new NoteError('Nie udało się załadować notatki do edycji', 'LOAD_NOTE_ERROR');
        }
        const note = await response.json();
        isEditing = true;
        editingNoteId = id;
        titleInput.value = note.title;
        quill.root.innerHTML = note.content;
        categorySelect.value = note.category;
        selectedColor = note.color;

        const colorOptions = colorPicker.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-color') === selectedColor) {
                option.classList.add('selected');
            }
        });

        openPanel();
    } catch (error) {
        if (error instanceof NoteError) {
            showError(error.message);
        } else {
            showError('Wystąpił nieznany błąd podczas ładowania notatki do edycji');
        }
    }
}

const deleteNoteHandler = (id) => {
    noteToDelete = id;
    confirmModal.style.display = 'block';
}

confirmYesBtn.addEventListener('click', async () => {
    try {
        if (noteToDelete) {
            const response = await fetch(`http://localhost:3000/api/notes/${noteToDelete}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new NoteError('Nie udało się usunąć notatki', 'DELETE_NOTE_ERROR');
            }
            noteToDelete = null;
            loadNotes();
        }
    } catch (error) {
        if (error instanceof NoteError) {
            showError(error.message);
        } else {
            showError('Wystąpił nieznany błąd podczas usuwania notatki');
        }
    } finally {
        confirmModal.style.display = 'none';
    }
});

confirmNoBtn.addEventListener('click', () => {
    confirmModal.style.display = 'none';
});

const deleteAllNotes = () => {
    confirmAllModal.style.display = 'block';
}

confirmAllYesBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/notes', { method: 'DELETE' });
        if (!response.ok) {
            throw new NoteError('Nie udało się usunąć wszystkich notatek', 'DELETE_ALL_NOTES_ERROR');
        }
        noteArea.innerHTML = '';
    } catch (error) {
        if (error instanceof NoteError) {
            showError(error.message);
        } else {
            showError('Wystąpił nieznany błąd podczas usuwania wszystkich notatek');
        }
    } finally {
        confirmAllModal.style.display = 'none';
    }
});

confirmAllNoBtn.addEventListener('click', () => {
    confirmAllModal.style.display = 'none';
});

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const notes = document.querySelectorAll('.note');
    notes.forEach(note => {
        const title = note.querySelector('.note-title').textContent.toLowerCase();
        const body = note.querySelector('.note-body').textContent.toLowerCase();
        if (title.includes(searchTerm) || body.includes(searchTerm)) {
            note.style.display = 'block';
        } else {
            note.style.display = 'none';
        }
    });
});

categoryFilter.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    const notes = document.querySelectorAll('.note');
    notes.forEach(note => {
        if (selectedCategory === 'all' || note.dataset.category === selectedCategory) {
            note.style.display = 'block';
        } else {
            note.style.display = 'none';
        }
    });
});

addBtn.addEventListener('click', openPanel);
cancelBtn.addEventListener('click', closePanel);
saveBtn.addEventListener('click', addNote);
deleteAllBtn.addEventListener('click', deleteAllNotes);

const setNoteColor = (note, color) => {
    const gradients = {
        'Kolor1': 'linear-gradient(135deg, #ffffd8, #fff9c4)',  
        'Kolor2': 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',  
        'Kolor3': 'linear-gradient(135deg, #e3f2fd, #bbdefb)',  
        'Kolor4': 'linear-gradient(135deg, #ffebee, #ffcdd2)', 
        'Kolor5': 'linear-gradient(135deg, #fff3e0, #ffe0b2)'   
    };
    note.style.backgroundImage = gradients[color] || 'linear-gradient(135deg, #ffffff, #f0f0f0)';
}

colorPicker.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-option')) {
        const colorOptions = colorPicker.querySelectorAll('.color-option');
        colorOptions.forEach(option => option.classList.remove('selected'));
        e.target.classList.add('selected');
        selectedColor = e.target.getAttribute('data-color');
    }
});

document.addEventListener('DOMContentLoaded', loadNotes);

