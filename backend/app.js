import express from "express";
const app = express();

app.use(express.json()); // pentru a putea parsa body-ul JSON la POST/PUT

// ... importuri pentru rute ...
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import categoryRoutes from "./routes/category.route.js";
import cartRoutes from "./routes/cart.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import appointmentRoutes from "./routes/appointment.route.js";
import mechanicRoutes from "./routes/mechanic.route.js";
import serviceOrderRoutes from "./routes/serviceOrder.route.js";
import vehicleRoutes from "./routes/vehicle.route.js";

// ... montarea rutelor ...
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/service-orders", serviceOrderRoutes);
app.use("/api/vehicles", vehicleRoutes);


export default app;