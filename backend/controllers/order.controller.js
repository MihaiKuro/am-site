import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { updateFeaturedProductsCache } from "./product.controller.js";
import { stripe } from "../lib/stripe.js";

const restoreOrderStock = async (orderItems) => {
    for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    await updateFeaturedProductsCache();
};

export const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, deliveryMethod, totalPrice } = req.body;

        console.log('Creating order with data:', { orderItems, shippingAddress, paymentMethod, totalPrice, userId: req.user?._id });

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "No order items" });
        }

        // Check if products exist and update stock
        const orderItemsWithPrice = [];
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                console.error(`Product not found: ${item.product}`);
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }
            if (product.stock < item.quantity) {
                console.error(`Insufficient stock for product: ${product.name}`);
                return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
            }
            product.stock -= item.quantity;
            await product.save();
            orderItemsWithPrice.push({
                product: item.product,
                quantity: item.quantity,
                price: product.price
            });
        }

        await updateFeaturedProductsCache();

        const order = new Order({
            user: req.user._id,
            orderItems: orderItemsWithPrice,
            shippingAddress,
            paymentMethod,
            deliveryMethod: deliveryMethod || "courier",
            totalPrice,
        });

        const createdOrder = await order.save();
        console.log('Order created successfully:', createdOrder._id);
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Error in createOrder:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate(
            "orderItems.product",
            "name image price"
        );
        res.json({ orders });
    } catch (error) {
        console.error('Error in getMyOrders:', error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate("orderItems.product", "name image price");

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate("user", "firstName lastName email")
            .populate("orderItems.product", "name image price");
        res.json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        // Optionally: validate status value
        const allowedStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        order.status = status;
        // If delivered, mark as paid
        if (status === "Delivered" && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = new Date();
        }
        await order.save();
        res.json({ success: true, order });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Error updating order status", error: error.message });
    }
}; 

export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        await order.deleteOne();
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Error deleting order", error: error.message });
    }
};

export const cancelMyOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Comanda nu a fost găsită" });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Nu ai permisiunea să anulezi această comandă" });
        }

        if (order.status === "Cancelled") {
            return res.status(400).json({ success: false, message: "Comanda este deja anulată" });
        }

        if (order.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Doar comenzile în așteptare pot fi anulate",
            });
        }

        if (order.isPaid && order.paymentMethod === "card" && order.stripeSessionId && stripe) {
            const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
            const paymentIntentId =
                typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id;

            if (paymentIntentId) {
                await stripe.refunds.create({ payment_intent: paymentIntentId });
            }
        }

        await restoreOrderStock(order.orderItems);
        order.status = "Cancelled";
        await order.save();

        res.json({ success: true, message: "Comanda a fost anulată", order });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({
            success: false,
            message: "Eroare la anularea comenzii",
            error: error.message,
        });
    }
};