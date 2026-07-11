import Appointment from "../models/appointment.model.js";
import { resolveVehicleDetails } from "../lib/vehicleDetails.js";
import {
  formatSlotTime,
  getCalendarDateInTimezone,
  getDaySearchBounds,
  findConflictingAppointment,
  getReservedSlotTimes,
} from "../lib/appointmentSlots.js";

// Creează o programare nouă
export const createAppointment = async (req, res) => {
  try {
    const { vehicle, serviceType, date, note, mechanic } = req.body;

    if (!mechanic) {
      return res.status(400).json({ success: false, message: "Mecanicul este obligatoriu" });
    }

    const apptDate = new Date(date);
    if (Number.isNaN(apptDate.getTime())) {
      return res.status(400).json({ success: false, message: "Data programării este invalidă" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (apptDate < today) {
      return res.status(400).json({ success: false, message: "Nu poți face o programare în trecut!" });
    }

    const calendarDay = getCalendarDateInTimezone(apptDate);
    const slotTime = formatSlotTime(apptDate);
    const { searchStart, searchEnd } = getDaySearchBounds(calendarDay);

    const existingAppointments = await Appointment.find({
      mechanic,
      date: { $gte: searchStart, $lte: searchEnd },
      status: { $ne: "Anulată" },
    });

    if (findConflictingAppointment(existingAppointments, calendarDay, slotTime)) {
      return res.status(409).json({
        success: false,
        message: "Acest interval orar este deja rezervat pentru mecanicul selectat.",
      });
    }

    const appointment = new Appointment({
      user: req.user._id,
      vehicle,
      serviceType,
      date: apptDate,
      note,
      mechanic,
    });
    await appointment.save();
    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Listare programări proprii
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate("mechanic", "name")
      .sort({ date: -1 })
      .lean();

    const enrichedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const vehicleDetails = await resolveVehicleDetails(appointment.vehicle);
        return {
          ...appointment,
          vehicleLabel: vehicleDetails.label,
          vehicleLicensePlate: vehicleDetails.licensePlate,
        };
      })
    );

    res.json({ success: true, appointments: enrichedAppointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Anulare programare (doar userul propriu)
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Programare nu a fost găsită" });
    }
    appointment.status = "Anulată";
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReservedSlots = async (req, res) => {
  try {
    const { date, mechanicId } = req.query;
    if (!date || !mechanicId) {
      return res.status(400).json({ success: false, message: "Date and mechanicId required" });
    }

    const { searchStart, searchEnd, dateStr } = getDaySearchBounds(date);

    const appointments = await Appointment.find({
      mechanic: mechanicId,
      date: { $gte: searchStart, $lte: searchEnd },
      status: { $ne: "Anulată" },
    });

    const reservedSlots = getReservedSlotTimes(appointments, dateStr);

    res.json({ success: true, reservedSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("user", "firstName lastName email")
      .populate("mechanic", "name email phone")
      .sort({ date: -1 })
      .lean();

    const enrichedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const vehicleDetails = await resolveVehicleDetails(appointment.vehicle);
        return {
          ...appointment,
          vehicleLabel: vehicleDetails.label,
          vehicleLicensePlate: vehicleDetails.licensePlate,
        };
      })
    );

    res.json({ success: true, appointments: enrichedAppointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Programare nu a fost găsită" });
    }
    appointment.status = "Confirmată";
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelAppointmentAdmin = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Programare nu a fost găsită" });
    }
    if (appointment.status === "Finalizată") {
      return res.status(400).json({
        success: false,
        message: "Programările finalizate nu pot fi anulate.",
      });
    }
    appointment.status = "Anulată";
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAppointmentAdmin = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Programare nu a fost găsită" });
    }
    if (appointment.status !== "Anulată") {
      return res.status(400).json({ success: false, message: "Doar programările anulate pot fi șterse" });
    }
    await appointment.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};