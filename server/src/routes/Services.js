import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  bulkUploadServices,
} from "../controllers/Services.js";
import { authenticateToken, isAdmin } from "../middlewares/authMiddleware.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, isAdmin, createService);
router.get("/", authenticateToken, isAdmin, getAllServices);
router.get("/:id", authenticateToken, isAdmin, getServiceById);
router.put("/:id", authenticateToken, isAdmin, updateService);
router.delete("/:id", authenticateToken, isAdmin, deleteService);
router.post(
  "/bulk-upload",
  authenticateToken,
  isAdmin,
  uploadMiddleware,
  bulkUploadServices
);

export default router;
