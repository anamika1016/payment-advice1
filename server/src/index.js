import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import cors from "cors";
import serviceRoutes from "./routes/Services.js";
import incidentRoutes from "./routes/Incidents.js";
import userRoutes from "./routes/Users.js";
import invoiceRoutes from "./routes/Invoice.js"

// configure env
dotenv.config();

//database config
connectDB();

// rest object
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/v1/service", serviceRoutes);
app.use("/api/v1/incident", incidentRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/invoice", invoiceRoutes)

//rest api
app.get("/", (req, res) => {
  res.status(200).send(`
    <h1>Welcome to Payment Advice Server</h1>
  `);
});

//PORT
const PORT = process.env.PORT || 8080;

//run listen
app.listen(PORT, () => {
  console.log(
    `Server running on ${process.env.DEV_MODE} at ${PORT}`.bgCyan.white
  );
});
