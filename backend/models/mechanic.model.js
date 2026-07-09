import mongoose from "mongoose";

const mechanicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  specialization: { type: String },
  // Add more fields as needed
}, { timestamps: true });

const Mechanic = mongoose.model("Mechanic", mechanicSchema);

export default Mechanic; 