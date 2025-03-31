const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("./shop.db", (err) => {
  if (err) {
    console.error("Błąd przy otwieraniu bazy danych:", err);
  } else {
    console.log("Połączono z bazą danych SQLite.");
  }
});

db.serialize(() => {
  // Tabela sklepów
  db.run(
    `CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Błąd przy tworzeniu tabeli shops:", err);
      }
    }
  );

  // Tabela przypomnień
  db.run(
    `CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productName TEXT NOT NULL,
      frequency INTEGER NOT NULL,
      startDate TEXT NOT NULL,
      remainingDays INTEGER NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Błąd przy tworzeniu tabeli reminders:", err);
      }
    }
  );

  // Tabela produktów – każdy produkt jest powiązany ze sklepem (shop_id)
  db.run(
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price TEXT,
      link TEXT,
      note TEXT,
      FOREIGN KEY(shop_id) REFERENCES shops(id)
    )`,
    (err) => {
      if (err) {
        console.error("Błąd przy tworzeniu tabeli products:", err);
      }
    }
  );
});

// --- Endpoints dla sklepów ---

// Dodawanie sklepu
app.post("/api/shops", (req, res) => {
  const { name } = req.body;
  if (!name || name.length > 100) {
    return res
      .status(400)
      .json({
        error: "Nazwa sklepu jest wymagana i musi mieć mniej niż 100 znaków.",
      });
  }
  const stmt = db.prepare("INSERT INTO shops (name) VALUES (?)");
  stmt.run(name, function (err) {
    if (err) {
      console.error("Błąd przy dodawaniu sklepu:", err);
      return res
        .status(500)
        .json({ error: "Błąd serwera przy dodawaniu sklepu." });
    }
    res.status(201).json({ id: this.lastID, name });
  });
  stmt.finalize();
});

// Aktualizacja sklepu
app.put("/api/shops/:id", (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  if (!name || name.length > 100) {
    return res.status(400).json({ error: "Nazwa sklepu musi być poprawna." });
  }
  db.run("UPDATE shops SET name = ? WHERE id = ?", [name, id], function (err) {
    if (err) {
      console.error("Błąd przy aktualizowaniu sklepu:", err);
      return res
        .status(500)
        .json({ error: "Błąd serwera przy aktualizowaniu sklepu." });
    }
    if (this.changes === 0) {
      return res
        .status(404)
        .json({ error: "Sklep o podanym ID nie istnieje." });
    }
    res.status(200).json({ id, name });
  });
});

// Usuwanie sklepu
app.delete("/api/shops/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM shops WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Błąd przy usuwaniu sklepu:", err);
      return res
        .status(500)
        .json({ error: "Błąd serwera przy usuwaniu sklepu." });
    }
    if (this.changes === 0) {
      return res
        .status(404)
        .json({ error: "Sklep o podanym ID nie istnieje." });
    }
    res.status(200).json({ message: "Sklep został usunięty" });
  });
});

// Pobieranie sklepów wraz z produktami (LEFT JOIN)
app.get("/api/shops", (req, res) => {
  const query = `
    SELECT 
      shops.id AS shop_id,
      shops.name AS shop_name,
      products.id AS product_id,
      products.name AS product_name,
      products.price,
      products.link,
      products.note
    FROM shops
    LEFT JOIN products ON shops.id = products.shop_id
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Błąd przy pobieraniu sklepów z produktami:", err);
      return res
        .status(500)
        .json({ error: "Błąd serwera przy pobieraniu danych." });
    }
    const shopsMap = {};
    rows.forEach((row) => {
      if (!shopsMap[row.shop_id]) {
        shopsMap[row.shop_id] = {
          id: row.shop_id,
          name: row.shop_name,
          products: [],
        };
      }
      if (row.product_id) {
        shopsMap[row.shop_id].products.push({
          id: row.product_id,
          name: row.product_name,
          price: row.price,
          link: row.link,
          note: row.note,
        });
      }
    });
    const shopsWithProducts = Object.values(shopsMap);
    res.status(200).json(shopsWithProducts);
  });
});

// --- Endpoints dla przypomnień ---

// Dodawanie przypomnienia
app.post("/api/reminders", (req, res) => {
  const { productName, frequency, startDate, remainingDays } = req.body;
  if (
    !productName ||
    productName.length > 50 ||
    !frequency ||
    frequency > 1000
  ) {
    return res.status(400).json({ error: "Niepoprawne dane przypomnienia." });
  }
  const stmt = db.prepare(
    "INSERT INTO reminders (productName, frequency, startDate, remainingDays) VALUES (?, ?, ?, ?)"
  );
  stmt.run(
    productName,
    frequency,
    startDate || new Date().toISOString(),
    remainingDays || frequency,
    function (err) {
      if (err) {
        console.error("Błąd przy dodawaniu przypomnienia:", err);
        return res
          .status(500)
          .json({ error: "Błąd serwera przy dodawaniu przypomnienia." });
      }
      res.status(201).json({
        id: this.lastID,
        productName,
        frequency,
        startDate: startDate || new Date().toISOString(),
        remainingDays: remainingDays || frequency,
      });
    }
  );
  stmt.finalize();
});

// Pobieranie przypomnień
app.get("/api/reminders", (req, res) => {
  db.all("SELECT * FROM reminders", [], (err, rows) => {
    if (err) {
      console.error("Błąd przy pobieraniu przypomnień:", err);
      return res
        .status(500)
        .json({ error: "Błąd serwera przy pobieraniu przypomnień." });
    }
    res.status(200).json(rows);
  });
});

// Usuwanie przypomnienia
app.delete("/api/reminders/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM reminders WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Błąd przy usuwaniu przypomnienia:", err);
      return res
        .status(500)
        .json({ error: "Błąd serwera przy usuwaniu przypomnienia." });
    }
    if (this.changes === 0) {
      return res
        .status(404)
        .json({ error: "Przypomnienie o podanym ID nie istnieje." });
    }
    res.status(200).json({ message: "Przypomnienie zostało usunięte." });
  });
});

// --- Endpoints dla produktów ---
// Dodawanie produktu do sklepu
app.post("/api/shops/:shopId/products", (req, res) => {
  const { shopId } = req.params;
  const shopIdNum = parseInt(shopId, 10);
  // Rozszerzamy obsługę, aby umożliwić przesyłanie alternatywnych kluczy:
  const { name, price, link, note, amount, category } = req.body;
  // Używamy przekazanej ceny lub, jeśli nie ma, klucza amount
  const finalPrice = price !== undefined ? price : amount;
  // Używamy notatki lub, jeśli nie ma, klucza category
  const finalNote = note !== undefined ? note : category;
  if (!name) {
    return res.status(400).json({ error: "Nazwa produktu jest wymagana." });
  }
  console.log("Otrzymano produkt do dodania dla shopId:", shopIdNum, req.body);
  // Sprawdzamy, czy sklep istnieje
  db.get("SELECT id FROM shops WHERE id = ?", [shopIdNum], (err, shop) => {
    if (err) {
      console.error("Błąd przy wyszukiwaniu sklepu:", err);
      return res.status(500).json({ error: "Błąd serwera." });
    }
    if (!shop) {
      return res
        .status(404)
        .json({ error: "Sklep o podanym ID nie istnieje." });
    }
    const stmt = db.prepare(
      "INSERT INTO products (shop_id, name, price, link, note) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(
      shopIdNum,
      name,
      finalPrice,
      link,
      finalNote || "",
      function (err) {
        if (err) {
          console.error("Błąd przy dodawaniu produktu:", err);
          return res
            .status(500)
            .json({ error: "Błąd serwera przy dodawaniu produktu." });
        }
        console.log("Produkt dodany, ID:", this.lastID);
        res.status(201).json({
          id: this.lastID,
          shop_id: shopIdNum,
          name,
          price: finalPrice,
          link,
          note: finalNote || "",
        });
      }
    );
    stmt.finalize();
  });
});

// Pobieranie produktów dla danego sklepu
app.get("/api/shops/:shopId/products", (req, res) => {
  const { shopId } = req.params;
  db.all("SELECT * FROM products WHERE shop_id = ?", [shopId], (err, rows) => {
    if (err) {
      console.error("Błąd przy pobieraniu produktów:", err);
      return res
        .status(500)
        .json({ error: "Błąd serwera przy pobieraniu produktów." });
    }
    res.status(200).json(rows);
  });
});

// Usuwanie produktu dla danego sklepu
app.delete("/api/shops/:shopId/products/:id", (req, res) => {
  const { shopId, id } = req.params;
  db.run(
    "DELETE FROM products WHERE id = ? AND shop_id = ?",
    [id, shopId],
    function (err) {
      if (err) {
        console.error("Błąd przy usuwaniu produktu:", err);
        return res
          .status(500)
          .json({ error: "Błąd serwera przy usuwaniu produktu." });
      }
      if (this.changes === 0) {
        return res
          .status(404)
          .json({ error: "Produkt o podanym ID nie istnieje." });
      }
      res.status(200).json({ message: "Produkt został usunięty." });
    }
  );
});

// Strona główna
app.get("/", (req, res) => {
  res.send(
    "Serwer działa poprawnie. Użyj /api/shops, /api/reminders lub /api/shops/:shopId/products, aby uzyskać dostęp do danych."
  );
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer nasłuchuje na porcie ${PORT}`);
});
