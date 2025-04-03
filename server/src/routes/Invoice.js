import express from "express";
import {
  createInvoice,
  getInvoices,
  updateInvoiceStatus,
  editInvoice,
  deleteInvoice
} from "../controllers/Invoice.js";
import { authenticateToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, isAdmin, getInvoices);
router.post("/createInvoice", authenticateToken, isAdmin, createInvoice);
router.patch("/:invoiceId/status", authenticateToken, isAdmin, updateInvoiceStatus);
router.put("/:id", authenticateToken, isAdmin, editInvoice);
router.delete("/:id", authenticateToken, isAdmin, deleteInvoice);

export default router;
