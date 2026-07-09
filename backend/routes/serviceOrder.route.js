import express from "express";
import {
  createServiceOrder,
  getAllServiceOrders,
  getServiceOrderById,
  updateServiceOrder,
  addPartToOrder,
  addLaborToOrder,
  changeOrderStatus,
  deleteServiceOrder,
  getServiceHistory
} from "../controllers/serviceOrder.controller.js";

const router = express.Router();

// Creează fișă nouă
router.post("/", createServiceOrder);

// Toate fișele
router.get("/", getAllServiceOrders);

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

// Istoric intervenții
router.get("/history", getServiceHistory);

export default router; 