import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} from "../controllers/vehicle.controller.js";

const router = express.Router();

router.get("/my", protectRoute, getMyVehicles);
router.post("/", protectRoute, createVehicle);
router.get("/:id", protectRoute, getVehicleById);
router.put("/:id", protectRoute, updateVehicle);
router.delete("/:id", protectRoute, deleteVehicle);

export default router; 