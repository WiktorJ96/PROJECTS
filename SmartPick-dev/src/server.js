const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const db = new sqlite3.Database("./shop.db");

app.use(bodyParser.json()); 
app.use(cors()); 

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);
});

app.post("/api/shops", (req, res) => {
  const { name } = req.body;
  if (!name || name.length > 100) {
    return res
      .status(400)
      .send("Nazwa sklepu jest wymagana i musi mieć mniej niż 100 znaków.");
  }

  const stmt = db.prepare("INSERT INTO shops (name) VALUES (?)");
  stmt.run(name, function (err) {
    if (err) {
      return res.status(500).send("Błąd serwera przy dodawaniu sklepu.");
    }
    res.status(201).send({ id: this.lastID, name });
  });
  stmt.finalize();
});

app.put("/api/shops/:id", (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  if (!name || name.length > 100) {
    return res.status(400).send("Nazwa sklepu musi być poprawna.");
  }

  db.run(`UPDATE shops SET name = ? WHERE id = ?`, [name, id], function (err) {
    if (err) {
      return res.status(500).send("Błąd serwera przy aktualizowaniu sklepu.");
    }
    res.status(200).send({ id, name });
  });
});

app.delete("/api/shops/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM shops WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).send("Błąd serwera przy usuwaniu sklepu.");
    }
    if (this.changes === 0) {
      return res.status(404).send("Sklep o podanym ID nie istnieje.");
    }
    res.status(200).send({ message: "Sklep został usunięty" });
  });
});

app.get("/api/shops", (req, res) => {
  db.all(`SELECT * FROM shops`, [], (err, rows) => {
    if (err) {
      return res.status(500).send("Błąd serwera przy pobieraniu sklepów.");
    }
    res.status(200).json(rows);
  });
});

app.get("/", (req, res) => {
  res.send("Serwer działa poprawnie. Użyj /api/shops, aby uzyskać dostęp do listy sklepów.");
});

app.listen(5000, () => {
  console.log("Serwer nasłuchuje na porcie 5000");
});
