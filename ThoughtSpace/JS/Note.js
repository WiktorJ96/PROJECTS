import { NoteApp } from "./NoteApp.js";

export class NoteError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'NoteError';
        this.code = code;
    }
}

export class Note {
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