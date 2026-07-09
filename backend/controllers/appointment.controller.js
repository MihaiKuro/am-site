import Appointment from "../models/appointment.model.js";

// Creează o programare nouă
export const createAppointment = async (req, res) => {
  try {
    const { vehicle, serviceType, date, note, mechanic } = req.body;
    // Validare: nu permite programări în trecut
    const apptDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (apptDate < today) {
      return res.status(400).json({ success: false, message: "Nu poți face o programare în trecut!" });
    }
    const appointment = new Appointment({
      user: req.user._id,
      vehicle,
      serviceType,
      date,
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
    const appointments = await Appointment.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, appointments });
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
    if (!date || !mechanicId) return res.status(400).json({ success: false, message: "Date and mechanicId required" });

    // Caută toate programările pentru ziua respectivă și mecanic
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      mechanic: mechanicId,
      date: { $gte: start, $lte: end },
      status: { $ne: "Anulată" }
    });

    // Extrage orele rezervate
    const reservedSlots = appointments.map(a => a.date.toISOString().slice(11, 16)); // 'HH:mm'

    res.json({ success: true, reservedSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('user', 'firstName lastName email')
      .populate('mechanic', 'name email phone')
      .sort({ date: -1 });
    res.json({ success: true, appointments });
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