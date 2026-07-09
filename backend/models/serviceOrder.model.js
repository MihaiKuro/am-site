import mongoose from "mongoose";

const partUsedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  partNumber: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const laborSchema = new mongoose.Schema({
  description: { type: String, required: true },
  hours: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String },
});

const serviceOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicle: { type: String, required: true }, // sau ObjectId dacă ai model separat
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  mechanic: { type: mongoose.Schema.Types.ObjectId, ref: "Mechanic" },
  status: {
    type: String,
    enum: ["Deschisă", "În lucru", "Finalizată", "Anulată"],
    default: "Deschisă",
  },
  statusHistory: [statusHistorySchema],
  reportedIssues: { type: String },
  worksPerformed: { type: String },
  partsUsed: [partUsedSchema],
  labor: [laborSchema],
  totalParts: { type: Number, default: 0 },
  totalLabor: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

const ServiceOrder = mongoose.model("ServiceOrder", serviceOrderSchema);
export default ServiceOrder; 