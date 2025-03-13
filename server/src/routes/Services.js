import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/Services.js";
import {
  authenticateToken,
  authorizeUser,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, authorizeUser, createService);
router.get("/", getAllServices);
router.get("/:id", authenticateToken, authorizeUser, getServiceById);
router.put("/:id", authenticateToken, authorizeUser, updateService);
router.delete("/:id", authenticateToken, authorizeUser, deleteService);

export default router;
