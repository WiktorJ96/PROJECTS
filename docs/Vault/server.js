const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.mongoUrl = process.env.MONGO_URL || "mongodb://mongo:27017/data/dbvault";

    this.connectToDatabase();
    this.middlewares();
    this.routes();
  }

  connectToDatabase() {
    mongoose
      .connect(this.mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("Połączono z MongoDB!"))
      .catch((err) => console.error("Błąd połączenia z MongoDB:", err));
  }

  middlewares() {
    this.app.use(express.json());
    this.app.use(cors());

    // Serwowanie plików statycznych
    this.app.use(express.static(path.join(__dirname))); // Udostępnia wszystkie pliki w katalogu /app
    this.app.use("/js", express.static(path.join(__dirname, "JS"))); // Udostępnia katalog JS
    this.app.use("/assets", express.static(path.join(__dirname, "assets"))); // Udostępnia katalog assets
  }

  routes() {
    const transactionSchema = new mongoose.Schema({
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      category: { type: String, required: true },
      date: { type: Date, default: Date.now },
      currencyCode: { type: String, default: "PLN" },
    });

    const Transaction = mongoose.model("Transaction", transactionSchema);

    this.app.get("/api/transactions", async (req, res) => {
      try {
        const transactions = await Transaction.find();
        res.json(transactions);
      } catch (error) {
        res.status(500).json({ error: "Błąd podczas pobierania transakcji" });
      }
    });

    this.app.post("/api/transactions", async (req, res) => {
      try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.json(transaction);
      } catch (error) {
        res.status(500).json({ error: "Błąd podczas zapisywania transakcji" });
      }
    });

    this.app.delete("/api/transactions/:id", async (req, res) => {
      try {
        const result = await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: "Transakcja usunięta", result });
      } catch (error) {
        res.status(500).json({ error: "Błąd podczas usuwania transakcji" });
      }
    });

    this.app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "Vault.html"));
    });
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Serwer uruchomiony na porcie ${this.port}`);
    });
  }
}

const server = new Server();
server.listen();
