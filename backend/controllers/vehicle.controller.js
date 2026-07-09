import Vehicle from "../models/vehicle.model.js";

// Creează vehicul nou
export const createVehicle = async (req, res) => {
  try {
    const { make, model, year, licensePlate, vin } = req.body;
    const vehicle = new Vehicle({
      user: req.user._id,
      make,
      model,
      year,
      licensePlate,
      vin,
    });
    await vehicle.save();
    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    console.log("aci e buba");
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toate vehiculele userului
export const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Detalii vehicul
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, user: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update vehicul
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Șterge vehicul
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 