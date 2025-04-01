import express from "express";
import {
  createInvoice,
  getInvoices,
  updateInvoiceStatus,
} from "../controllers/Invoice.js";
import { authenticateToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, isAdmin, getInvoices);
router.post("/createInvoice", authenticateToken, isAdmin, createInvoice);
router.patch("/:id/status", authenticateToken, isAdmin, updateInvoiceStatus);

export default router;
