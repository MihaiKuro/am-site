import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import mongoose from "mongoose";
import ServiceOrder from "../models/serviceOrder.model.js";

export const getAnalyticsData = async () => {
	const totalUsers = await User.countDocuments();
	const totalProducts = await Product.countDocuments();

	// Only count Delivered or Shipped for sales/revenue
	const salesData = await Order.aggregate([
		{
			$match: { isPaid: true }
		},
		{
			$group: {
				_id: null,
				totalSales: { $sum: 1 },
				totalRevenue: { $sum: "$totalPrice" },
			},
		},
	]);

	const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

	// Count cancelled orders
	const cancelledCount = await Order.countDocuments({ status: "Cancelled" });

	return {
		users: totalUsers,
		products: totalProducts,
		totalSales,
		totalRevenue,
		cancelledOrders: cancelledCount,
	};
};

export const getDailySalesData = async (startDate, endDate) => {
	try {
		// Delivered/Shipped
		const dailySalesData = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
					status: { $in: ["Delivered", "Shipped"] }
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					sales: { $sum: 1 },
					revenue: { $sum: "$totalPrice" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// Cancelled
		const dailyCancelledData = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
					status: "Cancelled"
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					cancelled: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		const dateArray = getDatesInRange(startDate, endDate);

		return dateArray.map((date) => {
			const foundData = dailySalesData.find((item) => item._id === date);
			const foundCancelled = dailyCancelledData.find((item) => item._id === date);
			return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
				cancelled: foundCancelled?.cancelled || 0,
			};
		});
	} catch (error) {
		throw error;
	}
};

function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}

// Raport vânzări pe produs/categorie
export const getSalesReport = async (req, res) => {
	try {
		const { 
			period = 30, 
			categoryId, 
			subcategoryId, 
			limit = 10,
			startDate,
			endDate 
		} = req.query;

		// Construiește filtru pentru data
		let dateFilter = {};
		if (startDate && endDate) {
			dateFilter = {
				createdAt: {
					$gte: new Date(startDate),
					$lte: new Date(endDate)
				}
			};
		} else {
			// Folosește perioada în zile
			const daysAgo = new Date();
			daysAgo.setDate(daysAgo.getDate() - parseInt(period));
			dateFilter = {
				createdAt: { $gte: daysAgo }
			};
		}

		// Construiește pipeline pentru agregare
		const pipeline = [
			// Filtrează comenzile după dată și status (doar comenzile finalizate)
			{
				$match: {
					...dateFilter,
					status: { $in: ["Delivered", "Shipped"] }
				}
			},
			// Dezarhivează orderItems
			{
				$unwind: "$orderItems"
			},
			// Grupează după produs
			{
				$group: {
					_id: "$orderItems.product",
					totalQuantity: { $sum: "$orderItems.quantity" },
					totalRevenue: { $sum: { $multiply: ["$orderItems.quantity", { $subtract: ["$orderItems.price", "$product.basePrice"] }] } },
					orderCount: { $sum: 1 }
				}
			},
			// Sortează după cantitate descrescător
			{
				$sort: { totalQuantity: -1 }
			},
			// Limitează rezultatele
			{
				$limit: parseInt(limit)
			},
			// Populează informațiile despre produs
			{
				$lookup: {
					from: "products",
					localField: "_id",
					foreignField: "_id",
					as: "product"
				}
			},
			{
				$unwind: "$product"
			},
			// Populează informațiile despre categorie
			{
				$lookup: {
					from: "categories",
					localField: "product.category",
					foreignField: "_id",
					as: "category"
				}
			},
			{
				$unwind: "$category"
			},
			// Proiectează rezultatul final
			{
				$project: {
					_id: 1,
					productName: "$product.name",
					productPrice: "$product.price",
					basePrice: "$product.basePrice",
					categoryName: "$category.name",
					categoryId: "$category._id",
					totalQuantity: 1,
					totalRevenue: {
						$multiply: [
							"$totalQuantity",
							{ $subtract: ["$product.price", "$product.basePrice"] }
						]
					},
					orderCount: 1,
					averageOrderValue: {
						$cond: [
							{ $eq: ["$orderCount", 0] },
							0,
							{ $divide: [
								{ $multiply: ["$totalQuantity", { $subtract: ["$product.price", "$product.basePrice"] }] },
								"$orderCount"
							] }
						]
					}
				}
			}
		];

		// 1. $match pe dată și status la început
		pipeline.unshift({
			$match: {
				...dateFilter,
				status: { $in: ["Delivered", "Shipped"] }
			}
		});
		// 2. După $unwind: "$product", adaugă $match pe categorie/subcategorie dacă e cazul
		const unwindProductIndex = pipeline.findIndex(
			stage => stage.$unwind && stage.$unwind === "$product"
		);
		if (unwindProductIndex !== -1) {
			const matchObj = {};
			if (categoryId) matchObj["product.category"] = new mongoose.Types.ObjectId(categoryId);
			if (subcategoryId) matchObj["product.subcategory"] = new mongoose.Types.ObjectId(subcategoryId);
			if (Object.keys(matchObj).length > 0) {
				pipeline.splice(unwindProductIndex + 1, 0, { $match: matchObj });
			}
		}

		const salesReport = await Order.aggregate(pipeline);

		// Calculează statistici generale
		const totalStats = await Order.aggregate([
			{
				$match: dateFilter
			},
			{
				$unwind: "$orderItems"
			},
			{
				$lookup: {
					from: "products",
					localField: "orderItems.product",
					foreignField: "_id",
					as: "product"
				}
			},
			{
				$unwind: "$product"
			},
			{
				$group: {
					_id: null,
					totalRevenue: { $sum: { $multiply: ["$orderItems.quantity", { $subtract: ["$orderItems.price", "$product.basePrice"] }] } },
					totalQuantity: { $sum: "$orderItems.quantity" },
					totalOrders: { $sum: 1 }
				}
			}
		]);

		res.json({
			success: true,
			data: {
				salesReport,
				summary: totalStats[0] || {
					totalRevenue: 0,
					totalQuantity: 0,
					totalOrders: 0
				},
				filters: {
					period: parseInt(period),
					categoryId,
					subcategoryId,
					startDate,
					endDate
				}
			}
		});

	} catch (error) {
		console.error("Error in getSalesReport:", error);
		res.status(500).json({
			success: false,
			message: "Eroare la generarea raportului de vânzări",
			error: error.message
		});
	}
};

// Obține toate categoriile pentru filtrare
export const getCategoriesForFilter = async (req, res) => {
	try {
		const categories = await Category.find({}, { name: 1, _id: 1, subcategories: 1 });
		res.json({
			success: true,
			data: categories
		});
	} catch (error) {
		console.error("Error in getCategoriesForFilter:", error);
		res.status(500).json({
			success: false,
			message: "Eroare la obținerea categoriilor",
			error: error.message
		});
	}
};

// Raport general activitate service
export const getServiceSummary = async (req, res) => {
	try {
		const { startDate, endDate } = req.query;
		let dateFilter = {};
		if (startDate && endDate) {
			dateFilter = {
				createdAt: {
					$gte: new Date(startDate),
					$lte: new Date(endDate)
				}
			};
		}

		// Număr vehicule distincte
		const vehiclesCount = await ServiceOrder.distinct("vehicle", dateFilter).then(arr => arr.length);

		// Top tipuri intervenții (worksPerformed)
		const interventions = await ServiceOrder.aggregate([
			{ $match: dateFilter },
			{ $group: { _id: "$worksPerformed", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 5 }
		]);

		// Valoare medie comandă
		const avgOrder = await ServiceOrder.aggregate([
			{ $match: dateFilter },
			{ $group: { _id: null, avg: { $avg: "$totalCost" } } }
		]);

		// Încasări totale
		const totalRevenue = await ServiceOrder.aggregate([
			{ $match: dateFilter },
			{ $group: { _id: null, total: { $sum: "$totalCost" } } }
		]);

		// Grad încărcare mecanici
		const mechanicLoad = await ServiceOrder.aggregate([
			{ $match: dateFilter },
			{ $group: { _id: "$mechanic", count: { $sum: 1 } } },
			{ $sort: { count: -1 } }
		]);

		res.json({
			success: true,
			data: {
				vehiclesCount,
				interventions,
				avgOrder: avgOrder[0]?.avg || 0,
				totalRevenue: totalRevenue[0]?.total || 0,
				mechanicLoad
			}
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
