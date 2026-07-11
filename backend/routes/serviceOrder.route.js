import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
  createServiceOrder,
  getAllServiceOrders,
  getServiceOrderById,
  getServiceOrderByAppointmentId,
  updateServiceOrder,
  addPartToOrder,
  addLaborToOrder,
  changeOrderStatus,
  deleteServiceOrder,
  getServiceHistory,
  completeAppointmentServiceOrder,
} from "../controllers/serviceOrder.controller.js";

const router = express.Router();

// Creează fișă nouă
router.post("/", createServiceOrder);

// Toate fișele
router.get("/", getAllServiceOrders);

// Istoric intervenții — must be before /:id
router.get("/history", protectRoute, getServiceHistory);

router.post("/from-appointment/:id", protectRoute, adminRoute, completeAppointmentServiceOrder);

router.get("/by-appointment/:appointmentId", protectRoute, adminRoute, getServiceOrderByAppointmentId);

// Detalii fișă
router.get("/:id", getServiceOrderById);

// Update fișă
router.put("/:id", updateServiceOrder);

// Adaugă piesă
router.post("/:id/parts", addPartToOrder);

// Adaugă manoperă
router.post("/:id/labor", addLaborToOrder);

// Schimbă statusul
router.post("/:id/status", changeOrderStatus);

// Șterge fișă
router.delete("/:id", deleteServiceOrder);

export default router;
