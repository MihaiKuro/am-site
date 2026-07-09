import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: String, // sau ObjectId dacă vei avea model separat
      required: false,
    },
    serviceType: {
      type: String,
      required: true,
      enum: ["Revizie", "Diagnoză", "Reparație", "ITP", "Altele"],
      default: "Revizie",
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["În așteptare", "Confirmată", "Finalizată", "Anulată"],
      default: "În așteptare",
    },
    note: {
      type: String,
      required: false,
    },
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mechanic",
      required: true,
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment; 