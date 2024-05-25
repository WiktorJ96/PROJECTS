const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

const notesFilePath = './notes.json';

// Helper function to read notes from file
const readNotesFromFile = () => {
    if (!fs.existsSync(notesFilePath)) {
        return [];
    }
    const data = fs.readFileSync(notesFilePath, 'utf8');
    return JSON.parse(data || '[]');
};

// Helper function to write notes to file
const writeNotesToFile = (notes) => {
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
};

// Endpoint to get all notes
app.get('/api/notes', (req, res) => {
    const notes = readNotesFromFile();
    res.json(notes);
});

// Endpoint to get a single note by ID
app.get('/api/notes/:id', (req, res) => {
    const notes = readNotesFromFile();
    const noteId = req.params.id;
    console.log(`Fetching note with id: ${noteId}`); // Add this line
    const note = notes.find(note => note.id === noteId);
    if (note) {
        res.json(note);
    } else {
        res.status(404).send('Note not found');
    }
});

// Endpoint to add a new note
app.post('/api/notes', (req, res) => {
    const notes = readNotesFromFile();
    const newNote = req.body;
    notes.push(newNote);
    writeNotesToFile(notes);
    res.status(201).json(newNote);
});

// Endpoint to update a note
app.put('/api/notes/:id', (req, res) => {
    const notes = readNotesFromFile();
    const updatedNote = req.body;
    const noteId = req.params.id;
    console.log(`Updating note with id: ${noteId}`); // Add this line
    const noteIndex = notes.findIndex(note => note.id === noteId);
    if (noteIndex !== -1) {
        notes[noteIndex] = updatedNote;
        writeNotesToFile(notes);
        res.json(updatedNote);
    } else {
        res.status(404).send('Note not found');
    }
});

// Endpoint to delete a note
app.delete('/api/notes/:id', (req, res) => {
    let notes = readNotesFromFile();
    const noteId = req.params.id;
    console.log(`Deleting note with id: ${noteId}`); // Add this line
    notes = notes.filter(note => note.id !== noteId);
    writeNotesToFile(notes);
    res.status(204).send();
});

// Endpoint to delete all notes
app.delete('/api/notes', (req, res) => {
    writeNotesToFile([]);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
