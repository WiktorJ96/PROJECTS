// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.mongoUrl = process.env.MONGO_URL || "mongodb://mongo:27017/mydatabase";

    this.connectToDatabase();
    this.middlewares();
    this.routes();
  }

  // Połączenie z MongoDB
  connectToDatabase() {
    mongoose
      .connect(this.mongoUrl)
      .then(() => console.log("Połączono z MongoDB"))
      .catch((err) => console.error("Błąd połączenia z MongoDB:", err));
  }

  // Middleware
  middlewares() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  // Endpointy API
  routes() {
    // Schemat transakcji
    const transactionSchema = new mongoose.Schema({
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      category: { type: String, required: true },
      date: { type: Date, default: Date.now },
      currencyCode: { type: String, default: "USD" },
    });

    // Model transakcji
    const Transaction = mongoose.model("Transaction", transactionSchema);

    // Endpointy API
    this.app.get("/api/transactions", async (req, res) => {
      try {
        const transactions = await Transaction.find();
        if (transactions.length === 0) {
          return res.status(404).json({ message: "Nie znaleziono transakcji" });
        }
        res.json(transactions);
      } catch (error) {
        res
          .status(500)
          .json({
            error: "Błąd podczas pobierania transakcji",
            details: error.message,
          });
      }
    });

    this.app.post("/api/transactions", async (req, res) => {
      try {
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.json(newTransaction);
      } catch (error) {
        res
          .status(500)
          .json({
            error: "Błąd podczas zapisywania transakcji",
            details: error.message,
          });
      }
    });

    this.app.delete("/api/transactions/:id", async (req, res) => {
      try {
        const transactionId = req.params.id;
        const deletedTransaction =
          await Transaction.findByIdAndDelete(transactionId);
        if (!deletedTransaction) {
          return res
            .status(404)
            .json({ message: "Nie znaleziono transakcji do usunięcia" });
        }
        res.json({ message: "Transakcja usunięta" });
      } catch (error) {
        res
          .status(500)
          .json({
            error: "Błąd podczas usuwania transakcji",
            details: error.message,
          });
      }
    });
  }

  // Start serwera
  listen() {
    this.app.listen(this.port, () => {
      console.log(`Serwer uruchomiony na porcie ${this.port}`);
    });
  }
}

// Uruchomienie serwera
const server = new Server();
server.listen();
