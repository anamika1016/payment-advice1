import express from "express";
import { createInvoice, getInvoices } from "../controllers/Invoice.js";
import { authenticateToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, isAdmin, getInvoices);
router.post("/createInvoice", authenticateToken, isAdmin, createInvoice);

export default router;
