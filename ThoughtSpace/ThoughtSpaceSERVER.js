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
    const response = await fetch('http://localhost:3000/api/notes');
    if (response.ok) {
        const notes = await response.json();
        noteArea.innerHTML = '';
        notes.forEach(note => {
            createNoteElement(note);
        });
    } else {
        console.error('Failed to load notes');
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
    if (titleInput.value !== '' && quill.root.innerHTML.trim() !== '<p><br></p>' && selectedColor && categorySelect.value !== '') {
        const note = {
            id: isEditing ? editingNoteId : Date.now().toString(),
            title: titleInput.value,
            content: quill.root.innerHTML,
            category: categorySelect.value,
            color: selectedColor
        };

        const response = isEditing ?
            await fetch(`http://localhost:3000/api/notes/${editingNoteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note),
            }) :
            await fetch('http://localhost:3000/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note),
            });

        if (response.ok) {
            closePanel();
            loadNotes();
        } else {
            console.error('Failed to save note');
        }
    } else {
        error.style.visibility = 'visible';
    }
}

const editNoteHandler = async (id) => {
    const response = await fetch(`http://localhost:3000/api/notes/${id}`);
    if (response.ok) {
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
    } else {
        console.error('Failed to load note for editing');
    }
}

const deleteNoteHandler = (id) => {
    noteToDelete = id;
    confirmModal.style.display = 'block';
}

confirmYesBtn.addEventListener('click', async () => {
    if (noteToDelete) {
        const response = await fetch(`http://localhost:3000/api/notes/${noteToDelete}`, { method: 'DELETE' });
        if (response.ok) {
            noteToDelete = null;
            loadNotes();
        } else {
            console.error('Failed to delete note');
        }
    }
    confirmModal.style.display = 'none';
});

confirmNoBtn.addEventListener('click', () => {
    confirmModal.style.display = 'none';
});

const deleteAllNotes = () => {
    confirmAllModal.style.display = 'block';
}

confirmAllYesBtn.addEventListener('click', async () => {
    const response = await fetch('http://localhost:3000/api/notes', { method: 'DELETE' });
    if (response.ok) {
        noteArea.innerHTML = '';
    } else {
        console.error('Failed to delete all notes');
    }
    confirmAllModal.style.display = 'none';
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

        document.addEventListener('DOMContentLoaded', function () {
            const translations = {
                "pl": {},
                "en": {}
            };

            fetch('pl.json')
                .then(response => response.json())
                .then(data => {
                    translations['pl'] = data;
                });

            fetch('en.json')
                .then(response => response.json())
                .then(data => {
                    translations['en'] = data;
                });

            function translatePage(lang) {
                document.querySelectorAll('[data-lang-key]').forEach(element => {
                    const key = element.getAttribute('data-lang-key');
                    if (translations[lang][key]) {
                        element.innerHTML = translations[lang][key];
                    }
                });
                document.querySelectorAll('[data-placeholder-key]').forEach(element => {
                    const key = element.getAttribute('data-placeholder-key');
                    if (translations[lang][key]) {
                        element.placeholder = translations[lang][key];
                    }
                });
                document.querySelectorAll('select option').forEach(option => {
                    const key = option.getAttribute('data-lang-key');
                    if (translations[lang][key]) {
                        option.textContent = translations[lang][key];
                    }
                });
                document.documentElement.lang = lang;
            }

            document.getElementById('lang-pl').addEventListener('click', () => translatePage('pl'));
            document.getElementById('lang-en').addEventListener('click', () => translatePage('en'));

            
            translatePage('pl');
        });