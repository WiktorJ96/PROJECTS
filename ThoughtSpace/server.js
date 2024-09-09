const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

const notesFilePath = './notes.json';


const readNotesFromFile = () => {
    if (!fs.existsSync(notesFilePath)) {
        return [];
    }
    const data = fs.readFileSync(notesFilePath, 'utf8');
    return JSON.parse(data || '[]');
};

const writeNotesToFile = (notes) => {
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
};

app.get('/api/notes', (req, res) => {
    const notes = readNotesFromFile();
    res.json(notes);
});

app.get('/api/notes/:id', (req, res) => {
    const notes = readNotesFromFile();
    const noteId = req.params.id;
    console.log(`Fetching note with id: ${noteId}`); 
    const note = notes.find(note => note.id === noteId);
    if (note) {
        res.json(note);
    } else {
        res.status(404).send('Note not found');
    }
});

app.post('/api/notes', (req, res) => {
    const notes = readNotesFromFile();
    const newNote = req.body;
    notes.push(newNote);
    writeNotesToFile(notes);
    res.status(201).json(newNote);
});

app.put('/api/notes/:id', (req, res) => {
    const notes = readNotesFromFile();
    const updatedNote = req.body;
    const noteId = req.params.id;
    console.log(`Updating note with id: ${noteId}`); 
    const noteIndex = notes.findIndex(note => note.id === noteId);
    if (noteIndex !== -1) {
        notes[noteIndex] = updatedNote;
        writeNotesToFile(notes);
        res.json(updatedNote);
    } else {
        res.status(404).send('Note not found');
    }
});

app.delete('/api/notes/:id', (req, res) => {
    let notes = readNotesFromFile();
    const noteId = req.params.id;
    console.log(`Deleting note with id: ${noteId}`);
    notes = notes.filter(note => note.id !== noteId);
    writeNotesToFile(notes);
    res.status(204).send();
});

app.delete('/api/notes', (req, res) => {
    writeNotesToFile([]);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
