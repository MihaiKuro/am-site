import Mechanic from "../models/mechanic.model.js";

// Adaugă mecanic nou
export const createMechanic = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const mechanic = new Mechanic({ name, email, phone });
    await mechanic.save();
    res.status(201).json({ success: true, mechanic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Listare toți mecanicii
export const getAllMechanics = async (req, res) => {
  try {
    const mechanics = await Mechanic.find().sort({ createdAt: -1 });
    res.json({ success: true, mechanics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Șterge mecanic
export const deleteMechanic = async (req, res) => {
  try {
    const mechanic = await Mechanic.findByIdAndDelete(req.params.id);
    if (!mechanic) {
      return res.status(404).json({ success: false, message: "Mechanic not found" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 