import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import { updateFeaturedProductsCache } from "./product.controller.js";

// Default client URL if environment variable is not set
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;
		console.log('Received checkout request:', { products, couponCode, userId: req.user?._id });

		// Check authentication
		if (!req.user || !req.user._id) {
			console.error('User not authenticated');
			return res.status(401).json({ error: "User not authenticated" });
		}

		// Validate Stripe configuration
		if (!stripe) {
			throw new Error('Stripe configuration is missing');
		}

		if (!Array.isArray(products) || products.length === 0) {
			console.error('Invalid or empty products array');
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		// Validate products structure
		const isValidProducts = products.every(product => 
			product._id && 
			typeof product.name === 'string' &&
			typeof product.price === 'number' &&
			typeof product.quantity === 'number' &&
			product.image
		);

		if (!isValidProducts) {
			console.error('Invalid product data structure:', products);
			return res.status(400).json({ 
				error: "Invalid product data structure",
				receivedProducts: products
			});
		}

		let totalAmount = 0;

		console.log('Creating line items...');
		const lineItems = products.map((product) => {
			// Convert price to cents for Stripe
			const amount = Math.round(product.price * 100);
			totalAmount += amount * product.quantity;

			console.log('Processing product:', {
				name: product.name,
				price: product.price,
				amount_in_cents: amount,
				quantity: product.quantity
			});

			return {
				price_data: {
					currency: "ron",
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		let discountId = null;
		if (couponCode) {
			console.log('Processing coupon:', couponCode);
			try {
				const coupon = await Coupon.findOne({ 
					code: couponCode, 
					userId: req.user._id, 
					isActive: true 
				});
				
				if (coupon) {
					console.log('Found valid coupon:', coupon);
					try {
						// Create a Stripe coupon
						const stripeCoupon = await stripe.coupons.create({
							percent_off: coupon.discountPercentage,
							duration: 'once',
						});
						discountId = stripeCoupon.id;
						console.log('Created Stripe coupon:', stripeCoupon.id);
						
						// Apply discount to total
						totalAmount = Math.round(totalAmount * (1 - coupon.discountPercentage / 100));
					} catch (couponError) {
						console.error('Error creating Stripe coupon:', couponError.message);
						// Continue without applying coupon if there's an error
					}
				}
			} catch (dbCouponError) {
				console.error('Error querying coupon:', dbCouponError.message);
				// Continue without coupon
			}
		}

		console.log('Creating Stripe session with URLs:', {
			success_url: `${CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${CLIENT_URL}/purchase-cancel`
		});

		console.log('Stripe session params:', {
			itemCount: lineItems.length,
			totalAmount,
			userId: req.user._id.toString()
		});

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${CLIENT_URL}/purchase-cancel`,
			discounts: discountId ? [{ coupon: discountId }] : [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		console.log('Stripe session created successfully:', session.id);

		if (totalAmount >= 20000) {
			try {
				await createNewCoupon(req.user._id);
				console.log('New coupon created for user:', req.user._id);
			} catch (couponCreationError) {
				console.error('Error creating new coupon:', couponCreationError.message);
				// Don't fail the entire request if coupon creation fails
			}
		}
		res.status(200).json({ id: session.id, totalAmount });
	} catch (error) {
		console.error("Error processing checkout:", {
			message: error.message,
			stack: error.stack,
			code: error.code,
			statusCode: error.statusCode,
			type: error.type
		});
		res.status(500).json({ 
			message: "Error processing checkout", 
			error: error.message
		});
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// Prevent duplicate orders for the same Stripe session
			const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
			if (existingOrder) {
				return res.status(200).json({
					success: true,
					message: "Order already processed",
					orderId: existingOrder._id,
				});
			}

			// create a new Order
			const products = JSON.parse(session.metadata.products);

			// SCĂDEREA STOCULUI pentru fiecare produs
			const Product = (await import('../models/product.model.js')).default;
			for (const item of products) {
				const product = await Product.findById(item.id);
				if (product) {
					if (product.stock < item.quantity) {
						return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
					}
					product.stock -= item.quantity;
					await product.save();
				}
			}

			await updateFeaturedProductsCache();

			const newOrder = new Order({
				user: session.metadata.userId,
				orderItems: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: Number(product.price)
				})),
				totalPrice: session.amount_total / 100, // Stripe amount is in cents
				shippingAddress: {
					street: "Online payment - no address",
					city: "Online",
					postalCode: "000000",
					country: "RO"
				},
				paymentMethod: "card",
				isPaid: true,
				paidAt: new Date(),
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
};

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}
