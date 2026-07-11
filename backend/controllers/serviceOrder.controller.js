import ServiceOrder from "../models/serviceOrder.model.js";
import Appointment from "../models/appointment.model.js";
import Vehicle from "../models/vehicle.model.js";
import { resolveVehicleDetails, buildVehicleIdMatches } from "../lib/vehicleDetails.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePartsUsed = (partsUsed) => {
  if (!partsUsed?.trim()) return [];

  return partsUsed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name) => ({
      name,
      quantity: 1,
      price: 0,
    }));
};

const parseLabor = (laborHours) => {
  const hours = Number(laborHours);
  if (!hours || hours <= 0) return [];

  return [
    {
      description: "Manoperă",
      hours,
      rate: 0,
    },
  ];
};

// Creează fișă de service
export const createServiceOrder = async (req, res) => {
  try {
    const order = new ServiceOrder(req.body);
    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Listare toate fișele (admin)
export const getAllServiceOrders = async (req, res) => {
  try {
    const orders = await ServiceOrder.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Detalii fișă după id
export const getServiceOrderById = async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update fișă (ex: adaugă piese, manoperă, status, note)
export const updateServiceOrder = async (req, res) => {
  try {
    const order = await ServiceOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Adaugă piesă folosită
export const addPartToOrder = async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Not found" });
    order.partsUsed.push(req.body);
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Adaugă manoperă
export const addLaborToOrder = async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Not found" });
    order.labor.push(req.body);
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Schimbă statusul și adaugă în istoric
export const changeOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await ServiceOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Not found" });
    order.status = status;
    order.statusHistory.push({ status, note });
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeAppointmentServiceOrder = async (req, res) => {
  try {
    const { worksPerformed, partsUsed, laborHours, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Programarea nu a fost găsită" });
    }

    if (!worksPerformed?.trim() && !partsUsed?.trim() && (laborHours === undefined || laborHours === null || laborHours === "")) {
      return res.status(400).json({
        success: false,
        message: "Completează cel puțin lucrările efectuate, piese folosite sau orele de lucru.",
      });
    }

    const vehicleDetails = await resolveVehicleDetails(appointment.vehicle);
    const parsedParts = parsePartsUsed(partsUsed);
    const parsedLabor = parseLabor(laborHours);
    const totalParts = parsedParts.reduce((sum, part) => sum + part.price * part.quantity, 0);
    const totalLabor = parsedLabor.reduce((sum, item) => sum + item.hours * item.rate, 0);

    let serviceOrder = await ServiceOrder.findOne({ appointment: appointment._id });

    if (serviceOrder) {
      serviceOrder.worksPerformed = worksPerformed?.trim() || serviceOrder.worksPerformed;
      serviceOrder.partsUsed = parsedParts.length ? parsedParts : serviceOrder.partsUsed;
      serviceOrder.labor = parsedLabor.length ? parsedLabor : serviceOrder.labor;
      serviceOrder.totalParts = totalParts;
      serviceOrder.totalLabor = totalLabor;
      serviceOrder.totalCost = totalParts + totalLabor;
      serviceOrder.notes = notes?.trim() || serviceOrder.notes;
      serviceOrder.status = "Finalizată";
      serviceOrder.licensePlate = vehicleDetails.licensePlate || serviceOrder.licensePlate;
      serviceOrder.vin = vehicleDetails.vin || serviceOrder.vin;
      serviceOrder.vehicle = vehicleDetails.label;
      await serviceOrder.save();
    } else {
      serviceOrder = await ServiceOrder.create({
        user: appointment.user,
        vehicle: vehicleDetails.label,
        licensePlate: vehicleDetails.licensePlate,
        vin: vehicleDetails.vin,
        appointment: appointment._id,
        mechanic: appointment.mechanic,
        status: "Finalizată",
        statusHistory: [{ status: "Finalizată", note: notes?.trim() || "Programare finalizată" }],
        worksPerformed: worksPerformed?.trim() || "",
        partsUsed: parsedParts,
        labor: parsedLabor,
        totalParts,
        totalLabor,
        totalCost: totalParts + totalLabor,
        notes: notes?.trim() || appointment.note || "",
      });
    }

    const completionSummary = [
      worksPerformed?.trim(),
      partsUsed?.trim() ? `Piese: ${partsUsed.trim()}` : "",
      laborHours !== undefined && laborHours !== null && laborHours !== "" ? `Ore: ${laborHours}` : "",
    ].filter(Boolean).join(" | ");

    appointment.status = "Finalizată";
    appointment.note = notes?.trim() || completionSummary || appointment.note;
    await appointment.save();

    res.json({ success: true, appointment, serviceOrder });
  } catch (error) {
    console.error("Error in completeAppointmentServiceOrder:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Șterge fișă
export const deleteServiceOrder = async (req, res) => {
  try {
    const order = await ServiceOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Istoric intervenții pe vehicul sau client
export const getServiceHistory = async (req, res) => {
  try {
    const { vin, licensePlate, userId } = req.query;

    if (!vin && !licensePlate && !userId) {
      return res.status(400).json({
        success: false,
        message: "Specifică licensePlate, vin sau userId",
      });
    }

    let matchingAppointments = [];

    if (licensePlate) {
      const plateRegex = new RegExp(`^${escapeRegex(licensePlate.trim())}$`, "i");
      const ownsVehicle = await Vehicle.findOne({
        user: req.user._id,
        licensePlate: plateRegex,
      });

      if (!ownsVehicle) {
        return res.status(403).json({
          success: false,
          message: "Nu poți vedea istoricul acestui vehicul",
        });
      }

      const matchingVehicles = await Vehicle.find({
        user: req.user._id,
        licensePlate: plateRegex,
      }).select("_id");

      const vehicleIdMatches = buildVehicleIdMatches(matchingVehicles);
      matchingAppointments = await Appointment.find({
        user: req.user._id,
        status: "Finalizată",
        $or: [
          { vehicle: { $in: vehicleIdMatches } },
          { vehicle: plateRegex },
        ],
      });

      for (const appt of matchingAppointments) {
        const existingOrder = await ServiceOrder.findOne({ appointment: appt._id });
        if (existingOrder) continue;

        const vehicleDetails = await resolveVehicleDetails(appt.vehicle);
        await ServiceOrder.create({
          user: appt.user,
          vehicle: vehicleDetails.label,
          licensePlate: vehicleDetails.licensePlate,
          vin: vehicleDetails.vin,
          appointment: appt._id,
          mechanic: appt.mechanic,
          status: "Finalizată",
          statusHistory: [{ status: "Finalizată", note: "Programare finalizată" }],
          worksPerformed: appt.note || "",
          notes: appt.note || "",
          partsUsed: [],
          labor: [],
          totalParts: 0,
          totalLabor: 0,
          totalCost: 0,
        });
      }
    }

    const filter = {};

    if (userId) {
      if (userId !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Acces interzis" });
      }
      filter.user = userId;
    } else {
      filter.user = req.user._id;
    }

    if (licensePlate) {
      const plateRegex = new RegExp(`^${escapeRegex(licensePlate.trim())}$`, "i");
      filter.$or = [
        { licensePlate: plateRegex },
        { appointment: { $in: matchingAppointments.map((appt) => appt._id) } },
      ];
    }

    if (vin) {
      filter.vin = vin;
    }

    const history = await ServiceOrder.find(filter)
      .populate("user", "firstName lastName email")
      .populate("mechanic", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (error) {
    console.error("Error in getServiceHistory:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
