import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.mongoUrl =
      process.env.DOCKER_ENV === "true"
        ? process.env.MONGO_URL
        : "mongodb://localhost:27017/dbvault";

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
    this.app.use(express.static(path.join(__dirname)));
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

    // Endpoint do sprawdzania dostępności serwera
    this.app.get("/ping", (req, res) => {
      res.status(200).send("pong");
    });

    // Pobieranie transakcji
    this.app.get("/api/transactions", async (req, res) => {
      try {
        const transactions = await Transaction.find();
        res.json(transactions);
      } catch (error) {
        console.error("Błąd podczas pobierania transakcji:", error);
        res.status(500).json({ error: "Błąd podczas pobierania transakcji" });
      }
    });

    // Dodawanie transakcji
    this.app.post("/api/transactions", async (req, res) => {
      try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.json(transaction);
      } catch (error) {
        console.error("Błąd podczas zapisywania transakcji:", error);
        res.status(500).json({ error: "Błąd podczas zapisywania transakcji" });
      }
    });

    // Usuwanie transakcji
    this.app.delete("/api/transactions/:id", async (req, res) => {
      try {
        const result = await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: "Transakcja usunięta", result });
      } catch (error) {
        console.error("Błąd podczas usuwania transakcji:", error);
        res.status(500).json({ error: "Błąd podczas usuwania transakcji" });
      }
    });

    // Serwowanie strony głównej
    this.app.get("*", (req, res) => {
      if (req.accepts("html")) {
        res.sendFile(path.join(__dirname,"Vault.html"));
      } else {
        res.status(404).send("Not Found");
      }
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
