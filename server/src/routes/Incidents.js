import express from "express";
import {
  createIncident,
  getAllIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
} from "../controllers/Incidents.js";
import { authenticateToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, isAdmin, createIncident);
router.get("/", getAllIncidents);
router.get("/:id", authenticateToken, isAdmin, getIncidentById);
router.put("/:id", authenticateToken, isAdmin, updateIncident);
router.delete("/:id", authenticateToken, isAdmin, deleteIncident);

export default router;
