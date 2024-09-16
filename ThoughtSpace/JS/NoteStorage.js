
export class NoteStorage {
    static DB_NAME = 'ThoughtSpaceDB';
    static STORE_NAME = 'notes';

    static async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);
            request.onerror = () => reject(new Error("Nie udało się otworzyć bazy danych"));
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
            };
        });
    }

    static async addNote(note) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.add(note);
            request.onerror = () => reject(new Error("Nie udało się dodać notatki"));
            request.onsuccess = () => resolve(request.result);
        });
    }

    static async getNotes() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAll();
            request.onerror = () => reject(new Error("Nie udało się pobrać notatek"));
            request.onsuccess = () => resolve(request.result);
        });
    }

    static async updateNote(note) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(note);
            request.onerror = () => reject(new Error("Nie udało się zaktualizować notatki"));
            request.onsuccess = () => resolve(request.result);
        });
    }

    static async deleteNote(id) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(id);
            request.onerror = () => reject(new Error("Nie udało się usunąć notatki"));
            request.onsuccess = () => resolve(request.result);
        });
    }

    static async deleteAllNotes() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.clear();
            request.onerror = () => reject(new Error("Nie udało się usunąć wszystkich notatek"));
            request.onsuccess = () => resolve(request.result);
        });
    }
}