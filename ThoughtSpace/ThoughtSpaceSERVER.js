class NoteError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'NoteError';
        this.code = code;
    }
}

class Note {
    constructor(id, title, content, category, color) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.category = category;
        this.color = color;
    }

    toElement() {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.setAttribute('id', this.id);
        noteElement.innerHTML = `
            <div class="note-header">
                <h3 class="note-title">${this.escapeHtml(this.title)}</h3>
                <button class="edit-note" data-id="${this.id}"><i class="fas fa-edit icon"></i></button>
                <button class="delete-note" data-id="${this.id}"><i class="fas fa-times icon"></i></button>
            </div>
            <div class="note-body">${this.content}</div>
            <div class="note-category"><span>${this.escapeHtml(this.category)}</span></div>
        `;
        noteElement.dataset.category = this.category;
        noteElement.dataset.color = this.color;
        NoteApp.setNoteColor(noteElement, this.color);
        return noteElement;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

class NoteStorage {
    static API_URL = 'http://localhost:3000/api/notes';

    static async getNotes() {
        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) {
                throw new NoteError('Nie udało się pobrać notatek', 'GET_NOTES_ERROR');
            }
            return await response.json();
        } catch (error) {
            console.error("Błąd podczas pobierania notatek:", error);
            throw error;
        }
    }

    static async addNote(note) {
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note)
            });
            if (!response.ok) {
                throw new NoteError('Nie udało się dodać notatki', 'ADD_NOTE_ERROR');
            }
            return await response.json();
        } catch (error) {
            console.error("Błąd podczas dodawania notatki:", error);
            throw error;
        }
    }

    static async updateNote(note) {
        try {
            const response = await fetch(`${this.API_URL}/${note.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note)
            });
            if (!response.ok) {
                throw new NoteError('Nie udało się zaktualizować notatki', 'UPDATE_NOTE_ERROR');
            }
            return await response.json();
        } catch (error) {
            console.error("Błąd podczas aktualizacji notatki:", error);
            throw error;
        }
    }

    static async deleteNote(id) {
        try {
            const response = await fetch(`${this.API_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new NoteError('Nie udało się usunąć notatki', 'DELETE_NOTE_ERROR');
            }
        } catch (error) {
            console.error("Błąd podczas usuwania notatki:", error);
            throw error;
        }
    }

    static async deleteAllNotes() {
        try {
            const response = await fetch(this.API_URL, { method: 'DELETE' });
            if (!response.ok) {
                throw new NoteError('Nie udało się usunąć wszystkich notatek', 'DELETE_ALL_NOTES_ERROR');
            }
        } catch (error) {
            console.error("Błąd podczas usuwania wszystkich notatek:", error);
            throw error;
        }
    }
}

class NoteApp {
    constructor() {
        this.quill = new Quill('#editor', { theme: 'snow' });
        this.selectedColor = null;
        this.isEditing = false;
        this.editingNoteId = null;
        this.noteToDelete = null;
        this.deferredPrompt = null;

        this.initElements();
        this.bindEvents();
        this.loadNotes();
        this.setupPWA();
    }

    initElements() {
        this.noteArea = document.querySelector('.note-area');
        this.notePanel = document.querySelector('.note-panel');
        this.titleInput = document.querySelector('#title');
        this.categorySelect = document.querySelector('#category');
        this.colorPicker = document.querySelector('#color-picker');
        this.error = document.querySelector('.error');
        this.searchInput = document.querySelector('#search');
        this.categoryFilter = document.querySelector('#category-filter');
        this.confirmModal = document.getElementById('confirm-modal');
        this.confirmAllModal = document.getElementById('confirm-all-modal');
        this.installButton = document.querySelector('.installButton');
    }

    bindEvents() {
        document.querySelector('.add').addEventListener('click', () => this.openPanel());
        document.querySelector('.save').addEventListener('click', () => this.addNote());
        document.querySelector('.cancel').addEventListener('click', () => this.closePanel());
        document.querySelector('.delete-all').addEventListener('click', () => this.deleteAllNotes());
        
        document.getElementById('confirm-yes').addEventListener('click', () => this.confirmDelete());
        document.getElementById('confirm-no').addEventListener('click', () => this.cancelDelete());
        document.getElementById('confirm-all-yes').addEventListener('click', () => this.confirmDeleteAll());
        document.getElementById('confirm-all-no').addEventListener('click', () => this.cancelDeleteAll());

        this.searchInput.addEventListener('input', (e) => this.searchNotes(e.target.value));
        this.categoryFilter.addEventListener('change', (e) => this.filterNotesByCategory(e.target.value));
        this.colorPicker.addEventListener('click', (e) => this.selectColor(e));

        this.noteArea.addEventListener('click', (e) => {
            if (e.target.closest('.edit-note')) {
                this.editNoteHandler(e.target.closest('.edit-note').dataset.id);
            } else if (e.target.closest('.delete-note')) {
                this.deleteNoteHandler(e.target.closest('.delete-note').dataset.id);
            }
        });

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

        window.addEventListener('appinstalled', () => {
            this.hideInstallButton();
        });
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

    openPanel() {
        this.notePanel.style.display = 'flex';
    }

    closePanel() {
        this.notePanel.style.display = 'none';
        this.resetForm();
    }

    resetForm() {
        this.titleInput.value = '';
        this.quill.setText('');
        this.error.style.visibility = 'hidden';
        this.selectedColor = null;
        const colorOptions = this.colorPicker.querySelectorAll('.color-option');
        colorOptions.forEach(option => option.classList.remove('selected'));
        this.isEditing = false;
        this.editingNoteId = null;
    }

    async loadNotes() {
        try {
            const notes = await NoteStorage.getNotes();
            this.renderNotes(notes);
        } catch (error) {
            this.showError('Nie udało się załadować notatek: ' + error.message);
        }
    }

    renderNotes(notes) {
        this.noteArea.innerHTML = '';
        notes.forEach(noteData => {
            const note = new Note(noteData.id, noteData.title, noteData.content, noteData.category, noteData.color);
            const noteElement = note.toElement();
            this.noteArea.appendChild(noteElement);
        });
    }

    async addNote() {
        try {
            if (this.validateNoteInput()) {
                const note = {
                    id: this.isEditing ? this.editingNoteId : Date.now().toString(),
                    title: this.titleInput.value,
                    content: this.quill.root.innerHTML,
                    category: this.categorySelect.value,
                    color: this.selectedColor
                };

                if (this.isEditing) {
                    await NoteStorage.updateNote(note);
                } else {
                    await NoteStorage.addNote(note);
                }

                this.closePanel();
                await this.loadNotes();
            } else {
                throw new NoteError('Uzupełnij wszystkie pola!', 'VALIDATION_ERROR');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    validateNoteInput() {
        return this.titleInput.value.trim() !== '' && 
               this.quill.root.innerHTML.trim() !== '<p><br></p>' && 
               this.selectedColor && 
               this.categorySelect.value !== '';
    }

    async editNoteHandler(id) {
        try {
            const notes = await NoteStorage.getNotes();
            const note = notes.find(note => note.id === id);
            if (note) {
                this.isEditing = true;
                this.editingNoteId = id;
                this.titleInput.value = note.title;
                this.quill.root.innerHTML = note.content;
                this.categorySelect.value = note.category;
                this.selectedColor = note.color;

                const colorOptions = this.colorPicker.querySelectorAll('.color-option');
                colorOptions.forEach(option => {
                    option.classList.toggle('selected', option.getAttribute('data-color') === this.selectedColor);
                });

                this.openPanel();
            }
        } catch (error) {
            this.showError("Nie udało się załadować notatki do edycji");
        }
    }

    deleteNoteHandler(id) {
        this.noteToDelete = id;
        this.confirmModal.style.display = 'block';
    }

    async confirmDelete() {
        if (this.noteToDelete) {
            try {
                await NoteStorage.deleteNote(this.noteToDelete);
                this.noteToDelete = null;
                await this.loadNotes();
                this.confirmModal.style.display = 'none';
            } catch (error) {
                this.showError(error.message);
            }
        }
    }

    cancelDelete() {
        this.confirmModal.style.display = 'none';
    }

    deleteAllNotes() {
        this.confirmAllModal.style.display = 'block';
    }

    async confirmDeleteAll() {
        try {
            await NoteStorage.deleteAllNotes();
            await this.loadNotes();
            this.confirmAllModal.style.display = 'none';
        } catch (error) {
            this.showError(error.message);
        }
    }

    cancelDeleteAll() {
        this.confirmAllModal.style.display = 'none';
    }

    showError(message) {
        if (this.error) {
            this.error.textContent = message;
            this.error.style.visibility = 'visible';
            setTimeout(() => {
                this.error.style.visibility = 'hidden';
            }, 3000);
        }
    }

    searchNotes(searchTerm) {
        const notes = document.querySelectorAll('.note');
        const lowerSearchTerm = searchTerm.toLowerCase();
        notes.forEach(note => {
            const title = note.querySelector('.note-title').textContent.toLowerCase();
            const body = note.querySelector('.note-body').textContent.toLowerCase();
            note.style.display = (title.includes(lowerSearchTerm) || body.includes(lowerSearchTerm)) ? 'block' : 'none';
        });
    }

    filterNotesByCategory(selectedCategory) {
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            note.style.display = (selectedCategory === 'all' || note.dataset.category === selectedCategory) ? 'block' : 'none';
        });
    }

    selectColor(event) {
        if (event.target.classList.contains('color-option')) {
            const colorOptions = this.colorPicker.querySelectorAll('.color-option');
            colorOptions.forEach(option => option.classList.remove('selected'));
            event.target.classList.add('selected');
            this.selectedColor = event.target.getAttribute('data-color');
        }
    }

    static setNoteColor(note, color) {
        const gradients = {
            'Kolor1': 'linear-gradient(135deg, #ffffd8, #fff9c4)',  
            'Kolor2': 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',  
            'Kolor3': 'linear-gradient(135deg, #e3f2fd, #bbdefb)',  
            'Kolor4': 'linear-gradient(135deg, #ffebee, #ffcdd2)', 
            'Kolor5': 'linear-gradient(135deg, #fff3e0, #ffe0b2)'   
        };
        note.style.backgroundImage = gradients[color] || 'linear-gradient(135deg, #ffffff, #f0f0f0)';
    }
}

window.addEventListener('appinstalled', (evt) => {
});

window.addEventListener('storage', function(e) {
});

document.addEventListener('DOMContentLoaded', () => {
    window.noteApp = new NoteApp();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .catch(error => {
                console.error('Błąd podczas rejestracji Service Worker:', error);
            });
    });
}