import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

// Połączenie z MongoDB
const mongoUrl = process.env.MONGO_URL || "mongodb://mongo:27017/mydatabase";
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Połączono z MongoDB"))
  .catch((err) => console.error("Błąd połączenia z MongoDB:", err));

// Middleware
app.use(express.json());
app.use(cors());

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
app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas pobierania transakcji" });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.json(newTransaction);
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas zapisywania transakcji" });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    await Transaction.findByIdAndDelete(transactionId);
    res.json({ message: "Transakcja usunięta" });
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas usuwania transakcji" });
  }
});

// Start serwera
app.listen(port, () => {
  console.log(`Serwer uruchomiony na porcie ${port}`);
});
