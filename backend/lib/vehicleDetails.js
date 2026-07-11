import mongoose from "mongoose";
import Vehicle from "../models/vehicle.model.js";

export const resolveVehicleDetails = async (vehicleField) => {
  if (!vehicleField) {
    return { label: "Vehicul necunoscut", licensePlate: null, vin: null };
  }

  if (typeof vehicleField === "object" && vehicleField !== null) {
    const label = `${vehicleField.make || ""} ${vehicleField.model || ""}`.trim() || "Vehicul";
    return {
      label,
      licensePlate: vehicleField.licensePlate || null,
      vin: vehicleField.vin || null,
    };
  }

  const vehicleValue = String(vehicleField).trim();

  if (mongoose.Types.ObjectId.isValid(vehicleValue)) {
    const vehicleDoc = await Vehicle.findById(vehicleValue).lean();
    if (vehicleDoc) {
      return {
        label: `${vehicleDoc.make} ${vehicleDoc.model} (${vehicleDoc.year})`,
        licensePlate: vehicleDoc.licensePlate,
        vin: vehicleDoc.vin || null,
      };
    }
  }

  return { label: vehicleValue, licensePlate: null, vin: null };
};

export const buildVehicleIdMatches = (vehicles) =>
  vehicles.flatMap((vehicle) => [vehicle._id, vehicle._id.toString()]);
