import mongoose from "mongoose";
import ServiceOrder from "../models/serviceOrder.model.js";
import Appointment from "../models/appointment.model.js";
import Vehicle from "../models/vehicle.model.js";
import Product from "../models/product.model.js";
import { resolveVehicleDetails, buildVehicleIdMatches } from "../lib/vehicleDetails.js";
import { updateFeaturedProductsCache } from "./product.controller.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildLaborEntry = (laborHours, laborCost) => {
  const cost = Number(laborCost);
  const hours = Number(laborHours);

  if (!cost || cost <= 0) return { labor: [], totalLabor: 0 };

  if (hours && hours > 0) {
    return {
      labor: [{ description: "Manoperă", hours, rate: cost / hours }],
      totalLabor: cost,
    };
  }

  return {
    labor: [{ description: "Manoperă", hours: 1, rate: cost }],
    totalLabor: cost,
  };
};

const resolveCatalogParts = async (catalogParts = []) => {
  if (!Array.isArray(catalogParts) || catalogParts.length === 0) {
    return { parts: [], totalParts: 0, stockUpdates: [] };
  }

  const parts = [];
  const stockUpdates = [];
  let totalParts = 0;

  for (const item of catalogParts) {
    const quantity = Number(item.quantity);
    if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
      throw new Error("Produs invalid selectat din catalog");
    }
    if (!quantity || quantity <= 0) {
      throw new Error("Cantitatea pentru fiecare piesă trebuie să fie cel puțin 1");
    }

    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error("Un produs selectat nu mai există în catalog");
    }
    if (product.stock < quantity) {
      throw new Error(`Stoc insuficient pentru ${product.name}. Disponibil: ${product.stock}`);
    }

    const lineTotal = product.price * quantity;
    totalParts += lineTotal;
    stockUpdates.push({ productId: product._id, quantity });

    parts.push({
      product: product._id,
      name: product.name,
      quantity,
      price: product.price,
    });
  }

  return { parts, totalParts, stockUpdates };
};

const hasCompletionPayload = ({ worksPerformed, catalogParts, laborHours, laborCost }) =>
  Boolean(
    worksPerformed?.trim() ||
    (Array.isArray(catalogParts) && catalogParts.length > 0) ||
    (laborHours !== undefined && laborHours !== null && laborHours !== "") ||
    (laborCost !== undefined && laborCost !== null && laborCost !== "")
  );

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
    const { mechanicId } = req.query;
    const filter = {};

    if (mechanicId) {
      if (!mongoose.Types.ObjectId.isValid(mechanicId)) {
        return res.status(400).json({ success: false, message: "ID mecanic invalid" });
      }
      filter.mechanic = mechanicId;
    }

    const orders = await ServiceOrder.find(filter)
      .populate("mechanic", "name")
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
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

// Detalii fișă după programare
export const getServiceOrderByAppointmentId = async (req, res) => {
  try {
    const order = await ServiceOrder.findOne({ appointment: req.params.appointmentId })
      .populate("mechanic", "name");
    if (!order) {
      return res.status(404).json({ success: false, message: "Fișa de service nu a fost găsită" });
    }
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
  const session = await mongoose.startSession();

  try {
    const { worksPerformed, catalogParts, laborHours, laborCost, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Programarea nu a fost găsită" });
    }

    if (!hasCompletionPayload({ worksPerformed, catalogParts, laborHours, laborCost })) {
      return res.status(400).json({
        success: false,
        message: "Completează lucrările efectuate, piese din catalog sau costul manoperei.",
      });
    }

    const vehicleDetails = await resolveVehicleDetails(appointment.vehicle);
    const { parts, totalParts, stockUpdates } = await resolveCatalogParts(catalogParts);
    const { labor, totalLabor } = buildLaborEntry(laborHours, laborCost);
    const totalCost = totalParts + totalLabor;

    let serviceOrder;

    await session.withTransaction(async () => {
      for (const update of stockUpdates) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: update.productId, stock: { $gte: update.quantity } },
          { $inc: { stock: -update.quantity } },
          { new: true, session }
        );

        if (!updatedProduct) {
          throw new Error("Stoc insuficient pentru una dintre piesele selectate");
        }
      }

      const orderPayload = {
        user: appointment.user,
        vehicle: vehicleDetails.label,
        licensePlate: vehicleDetails.licensePlate,
        vin: vehicleDetails.vin,
        appointment: appointment._id,
        mechanic: appointment.mechanic,
        status: "Finalizată",
        worksPerformed: worksPerformed?.trim() || "",
        partsUsed: parts,
        labor,
        totalParts,
        totalLabor,
        totalCost,
        notes: notes?.trim() || appointment.note || "",
      };

      const existingOrder = await ServiceOrder.findOne({ appointment: appointment._id }).session(session);

      if (existingOrder) {
        existingOrder.set({
          ...orderPayload,
          statusHistory: [
            ...(existingOrder.statusHistory || []),
            { status: "Finalizată", note: notes?.trim() || "Programare actualizată" },
          ],
        });
        serviceOrder = await existingOrder.save({ session });
      } else {
        serviceOrder = await ServiceOrder.create(
          [{
            ...orderPayload,
            statusHistory: [{ status: "Finalizată", note: notes?.trim() || "Programare finalizată" }],
          }],
          { session }
        );
        serviceOrder = serviceOrder[0];
      }

      appointment.status = "Finalizată";
      appointment.note =
        notes?.trim() ||
        [
          worksPerformed?.trim(),
          parts.length ? `Piese: ${parts.map((part) => `${part.name} x${part.quantity}`).join(", ")}` : "",
          totalLabor ? `Manoperă: ${totalLabor} RON` : "",
          totalCost ? `Total: ${totalCost} RON` : "",
        ]
          .filter(Boolean)
          .join(" | ") ||
        appointment.note;
      await appointment.save({ session });
    });

    if (stockUpdates.length > 0) {
      await updateFeaturedProductsCache();
    }

    res.json({ success: true, appointment, serviceOrder });
  } catch (error) {
    console.error("Error in completeAppointmentServiceOrder:", error.message);
    res.status(error.message.includes("Stoc") ? 400 : 500).json({
      success: false,
      message: error.message || "Eroare la finalizarea programării",
    });
  } finally {
    session.endSession();
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
