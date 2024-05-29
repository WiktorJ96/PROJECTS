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

const loadNotes = () => {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    noteArea.innerHTML = '';
    notes.forEach(note => {
        createNoteElement(note);
    });
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

const saveNotesToLocalStorage = (notes) => {
    localStorage.setItem('notes', JSON.stringify(notes));
}

const addNote = () => {
    if (titleInput.value !== '' && quill.root.innerHTML.trim() !== '<p><br></p>' && selectedColor && categorySelect.value !== '') {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const note = {
            id: isEditing ? editingNoteId : Date.now().toString(),
            title: titleInput.value,
            content: quill.root.innerHTML,
            category: categorySelect.value,
            color: selectedColor
        };

        if (isEditing) {
            const index = notes.findIndex(note => note.id === editingNoteId);
            notes[index] = note;
        } else {
            notes.push(note);
        }

        saveNotesToLocalStorage(notes);
        closePanel();
        loadNotes();
    } else {
        error.style.visibility = 'visible';
    }
}

const editNoteHandler = (id) => {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes.find(note => note.id === id);
    if (note) {
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
    }
}

const deleteNoteHandler = (id) => {
    noteToDelete = id;
    confirmModal.style.display = 'block';
}

confirmYesBtn.addEventListener('click', () => {
    if (noteToDelete) {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const filteredNotes = notes.filter(note => note.id !== noteToDelete);
        saveNotesToLocalStorage(filteredNotes);
        noteToDelete = null;
        loadNotes();
    }
    confirmModal.style.display = 'none';
});

confirmNoBtn.addEventListener('click', () => {
    confirmModal.style.display = 'none';
});

const deleteAllNotes = () => {
    confirmAllModal.style.display = 'block';
}

confirmAllYesBtn.addEventListener('click', () => {
    localStorage.removeItem('notes');
    noteArea.innerHTML = '';
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
        'Kolor1': 'linear-gradient(135deg, #ffecd2, #fcb69f)',
        'Kolor2': 'linear-gradient(135deg, #d4fc79, #96e6a1)',
        'Kolor3': 'linear-gradient(135deg, #cfd9df, #e2ebf0)',
        'Kolor4': 'linear-gradient(135deg, #f3e7e9, #e3eeff)',
        'Kolor5': 'linear-gradient(135deg, #fbc2eb, #a6c1ee)'
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
                document.querySelectorAll('[data-placeholder-lang-key]').forEach(element => {
                    const key = element.getAttribute('data-placeholder-lang-key');
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