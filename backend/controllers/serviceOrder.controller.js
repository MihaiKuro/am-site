import ServiceOrder from "../models/serviceOrder.model.js";

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
    let filter = {};
    if (vin) filter.vin = vin;
    if (licensePlate) filter.licensePlate = licensePlate;
    if (userId) filter.user = userId;

    const history = await ServiceOrder.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('mechanic', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 