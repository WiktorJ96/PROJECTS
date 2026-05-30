import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Ustawienia dla __dirname w ES6 Modules
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
    this.staticRoot = existsSync(path.join(__dirname, "src"))
      ? path.join(__dirname, "src")
      : __dirname;

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
    this.app.use(express.static(this.staticRoot));
    this.app.use("/js", express.static(path.join(this.staticRoot, "scripts")));
    this.app.use("/assets", express.static(path.join(this.staticRoot, "assets")));
    this.app.use("/styles", express.static(path.join(this.staticRoot, "styles")));
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
      res.sendFile(path.join(this.staticRoot, "index.html"));
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


// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// class Server {
//   constructor() {
//     this.app = express();
//     this.port = process.env.PORT || 3000;

//     // WAŻNE: tu decydujesz, który URL idzie do Mongoose
//     // - w Dockerze: DOCKER_ENV === "true" i MONGO_URL = mongodb://mongo:27017/dbvault
//     // - lokalnie: DOCKER_ENV !== "true" => localhost
//     this.mongoUrl =
//       process.env.DOCKER_ENV === "true"
//         ? process.env.MONGO_URL
//         : "mongodb://localhost:27017/dbvault";

//     console.log("[BOOT] DOCKER_ENV =", process.env.DOCKER_ENV);
//     console.log("[BOOT] MONGO_URL (effective) =", this.mongoUrl);

//     this.connectToDatabase();
//     this.middlewares();
//     this.routes();
//   }

//   connectToDatabase() {
//     // logi niskiego poziomu
//     mongoose.connection.on("connecting", () =>
//       console.log("[DB] connecting...")
//     );
//     mongoose.connection.on("connected", () => console.log("[DB] connected ✔"));
//     mongoose.connection.on("reconnected", () =>
//       console.log("[DB] reconnected")
//     );
//     mongoose.connection.on("disconnected", () =>
//       console.log("[DB] disconnected ✖")
//     );
//     mongoose.connection.on("error", (err) =>
//       console.error("[DB] error:", err?.message || err)
//     );

//     mongoose
//       .connect(this.mongoUrl, {
//         // te opcje są domyślne w nowszych wersjach, ale nie szkodzą:
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       })
//       .then(() => console.log("[DB] Połączono z MongoDB!"))
//       .catch((err) => console.error("[DB] Błąd połączenia z MongoDB:", err));
//   }

//   middlewares() {
//     this.app.use(express.json());
//     this.app.use(cors());

//     // Statyczne zasoby
//     this.app.use(express.static(path.join(__dirname, "src")));
//     this.app.use("/js", express.static(path.join(__dirname, "scripts")));
//     this.app.use("/assets", express.static(path.join(__dirname, "assets")));
//     this.app.use("/styles", express.static(path.join(__dirname, "styles")));
//   }

//   routes() {
//     // Schemat + model (zabezpieczenie przed wielokrotną rejestracją modelu)
//     const transactionSchema = new mongoose.Schema({
//       name: { type: String, required: true },
//       amount: { type: Number, required: true },
//       category: { type: String, required: true },
//       date: { type: Date, default: Date.now },
//       currencyCode: { type: String, default: "PLN" },
//     });

//     const Transaction =
//       mongoose.models.Transaction ||
//       mongoose.model("Transaction", transactionSchema);

//     // Ping
//     this.app.get("/ping", (req, res) => res.status(200).send("pong"));

//     // HEALTHCHECK (uwzględnia stan bazy)
//     this.app.get("/health", (req, res) => {
//       // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
//       const states = [
//         "disconnected",
//         "connected",
//         "connecting",
//         "disconnecting",
//       ];
//       const dbStateCode = mongoose.connection.readyState;
//       const dbState = states[dbStateCode] ?? `unknown(${dbStateCode})`;

//       const payload = {
//         status: dbStateCode === 1 ? "ok" : "degraded",
//         uptime: process.uptime(),
//         db: dbState,
//         mongoUrl: this.mongoUrl, // pomoże w diagnozie
//       };

//       if (dbStateCode === 1) return res.status(200).json(payload);
//       return res.status(503).json(payload);
//     });

//     // Pobieranie transakcji
//     this.app.get("/api/transactions", async (req, res) => {
//       try {
//         const transactions = await Transaction.find();
//         res.json(transactions);
//       } catch (error) {
//         console.error("[API] GET /api/transactions error:", error);
//         res.status(500).json({ error: "Błąd podczas pobierania transakcji" });
//       }
//     });

//     // Dodawanie transakcji
//     this.app.post("/api/transactions", async (req, res) => {
//       try {
//         const transaction = new Transaction(req.body);
//         await transaction.save();
//         res.status(201).json(transaction);
//       } catch (error) {
//         console.error("[API] POST /api/transactions error:", error);
//         // Podajmy więcej kontekstu (walidacja/mongoose)
//         res.status(400).json({
//           error: "Błąd podczas zapisywania transakcji",
//           details: error?.message || error,
//         });
//       }
//     });

//     // Usuwanie transakcji
//     this.app.delete("/api/transactions/:id", async (req, res) => {
//       try {
//         const result = await Transaction.findByIdAndDelete(req.params.id);
//         res.json({ message: "Transakcja usunięta", result });
//       } catch (error) {
//         console.error("[API] DELETE /api/transactions/:id error:", error);
//         res.status(500).json({ error: "Błąd podczas usuwania transakcji" });
//       }
//     });

//     // Catch-all: NA KOŃCU
//     this.app.get("*", (req, res) => {
//       res.sendFile(path.join(__dirname, "src", "Vault.html"));
//     });
//   }

//   listen() {
//     this.app.listen(this.port, () => {
//       console.log(`Serwer uruchomiony na porcie ${this.port}`);
//     });
//   }
// }

// const server = new Server();
// server.listen();
