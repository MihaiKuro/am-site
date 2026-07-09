import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
  createMechanic,
  getAllMechanics,
  deleteMechanic,
} from "../controllers/mechanic.controller.js";

const router = express.Router();

router.post("/", protectRoute, adminRoute, createMechanic);
router.get("/", getAllMechanics);
router.delete("/:id", protectRoute, adminRoute, deleteMechanic);

export default router; 