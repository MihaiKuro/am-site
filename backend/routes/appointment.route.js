import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getReservedSlots,
  getAllAppointments,
  confirmAppointment,
  cancelAppointmentAdmin,
  deleteAppointmentAdmin,
} from "../controllers/appointment.controller.js";

const router = express.Router();

router.post("/", protectRoute, createAppointment);
router.get("/my", protectRoute, getMyAppointments);
router.put("/:id/cancel", protectRoute, cancelAppointment);
router.get("/slots", getReservedSlots);
router.get("/", protectRoute, adminRoute, getAllAppointments);
router.put("/:id/confirm", protectRoute, adminRoute, confirmAppointment);
router.put("/:id/cancel-admin", protectRoute, adminRoute, cancelAppointmentAdmin);
router.delete("/:id/admin", protectRoute, adminRoute, deleteAppointmentAdmin);

export default router; 