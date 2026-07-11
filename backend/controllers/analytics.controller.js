import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import mongoose from "mongoose";
import ServiceOrder from "../models/serviceOrder.model.js";

const buildDateFilter = (period, startDate, endDate) => {
	if (startDate && endDate) {
		return {
			createdAt: {
				$gte: new Date(startDate),
				$lte: new Date(endDate),
			},
		};
	}

	const daysAgo = new Date();
	daysAgo.setDate(daysAgo.getDate() - parseInt(period, 10));
	return { createdAt: { $gte: daysAgo } };
};

const productMarginExpr = (priceField, basePriceField) => ({
	$subtract: [priceField, { $ifNull: [basePriceField, 0] }],
});

const mergeProductSalesReports = (orderReport, serviceReport) => {
	const byProduct = new Map();

	for (const row of [...orderReport, ...serviceReport]) {
		const id = row._id.toString();
		if (!byProduct.has(id)) {
			byProduct.set(id, { ...row });
			continue;
		}

		const existing = byProduct.get(id);
		existing.totalQuantity += row.totalQuantity;
		existing.orderCount += row.orderCount;
		existing.totalRevenue += row.totalRevenue;
		existing.averageOrderValue =
			existing.orderCount > 0 ? existing.totalRevenue / existing.orderCount : 0;
	}

	return Array.from(byProduct.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
};

const aggregateServiceProductSales = async (dateFilter, categoryId, subcategoryId) => {
	const pipeline = [
		{
			$match: {
				...dateFilter,
				status: "Finalizată",
			},
		},
		{ $unwind: "$partsUsed" },
		{
			$match: {
				"partsUsed.product": { $exists: true, $ne: null },
			},
		},
		{
			$group: {
				_id: "$partsUsed.product",
				totalQuantity: { $sum: "$partsUsed.quantity" },
				orderCount: { $sum: 1 },
			},
		},
		{
			$lookup: {
				from: "products",
				localField: "_id",
				foreignField: "_id",
				as: "product",
			},
		},
		{ $unwind: "$product" },
	];

	if (categoryId) {
		pipeline.push({
			$match: { "product.category": new mongoose.Types.ObjectId(categoryId) },
		});
	}
	if (subcategoryId) {
		pipeline.push({
			$match: { "product.subcategory": new mongoose.Types.ObjectId(subcategoryId) },
		});
	}

	pipeline.push(
		{
			$lookup: {
				from: "categories",
				localField: "product.category",
				foreignField: "_id",
				as: "category",
			},
		},
		{ $unwind: "$category" },
		{
			$project: {
				_id: 1,
				productName: "$product.name",
				productPrice: "$product.price",
				basePrice: "$product.basePrice",
				categoryName: "$category.name",
				categoryId: "$category._id",
				totalQuantity: 1,
				orderCount: 1,
				totalRevenue: {
					$multiply: [
						"$totalQuantity",
						productMarginExpr("$product.price", "$product.basePrice"),
					],
				},
				averageOrderValue: {
					$cond: [
						{ $eq: ["$orderCount", 0] },
						0,
						{
							$divide: [
								{
									$multiply: [
										"$totalQuantity",
										productMarginExpr("$product.price", "$product.basePrice"),
									],
								},
								"$orderCount",
							],
						},
					],
				},
			},
		}
	);

	return ServiceOrder.aggregate(pipeline);
};

const aggregateServicePartsSummary = async (dateFilter) => {
	const result = await ServiceOrder.aggregate([
		{
			$match: {
				...dateFilter,
				status: "Finalizată",
			},
		},
		{ $unwind: "$partsUsed" },
		{
			$match: {
				"partsUsed.product": { $exists: true, $ne: null },
			},
		},
		{
			$lookup: {
				from: "products",
				localField: "partsUsed.product",
				foreignField: "_id",
				as: "product",
			},
		},
		{ $unwind: "$product" },
		{
			$group: {
				_id: null,
				totalRevenue: {
					$sum: {
						$multiply: [
							"$partsUsed.quantity",
							productMarginExpr("$partsUsed.price", "$product.basePrice"),
						],
					},
				},
				totalQuantity: { $sum: "$partsUsed.quantity" },
				totalOrders: { $sum: 1 },
			},
		},
	]);

	return result[0] || { totalRevenue: 0, totalQuantity: 0, totalOrders: 0 };
};

export const getAnalyticsData = async () => {
	const totalUsers = await User.countDocuments();
	const totalProducts = await Product.countDocuments();

	const salesData = await Order.aggregate([
		{
			$match: { isPaid: true },
		},
		{
			$group: {
				_id: null,
				totalSales: { $sum: 1 },
				totalRevenue: { $sum: "$totalPrice" },
			},
		},
	]);

	const serviceData = await ServiceOrder.aggregate([
		{
			$match: { status: "Finalizată" },
		},
		{
			$group: {
				_id: null,
				totalSales: { $sum: 1 },
				totalRevenue: { $sum: "$totalCost" },
			},
		},
	]);

	const orderStats = salesData[0] || { totalSales: 0, totalRevenue: 0 };
	const serviceStats = serviceData[0] || { totalSales: 0, totalRevenue: 0 };

	const cancelledCount = await Order.countDocuments({ status: "Cancelled" });

	return {
		users: totalUsers,
		products: totalProducts,
		totalSales: orderStats.totalSales + serviceStats.totalSales,
		totalRevenue: orderStats.totalRevenue + serviceStats.totalRevenue,
		cancelledOrders: cancelledCount,
	};
};

export const getDailySalesData = async (startDate, endDate) => {
	try {
		const dailySalesData = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
					status: { $in: ["Delivered", "Shipped"] },
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

		const dailyServiceData = await ServiceOrder.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
					status: "Finalizată",
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					sales: { $sum: 1 },
					revenue: { $sum: "$totalCost" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

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
			const foundService = dailyServiceData.find((item) => item._id === date);
			const foundCancelled = dailyCancelledData.find((item) => item._id === date);
			return {
				date,
				sales: (foundData?.sales || 0) + (foundService?.sales || 0),
				revenue: (foundData?.revenue || 0) + (foundService?.revenue || 0),
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

		const dateFilter = buildDateFilter(period, startDate, endDate);

		const pipeline = [
			{
				$match: {
					...dateFilter,
					status: { $in: ["Delivered", "Shipped"] },
				},
			},
			{
				$unwind: "$orderItems",
			},
			{
				$group: {
					_id: "$orderItems.product",
					totalQuantity: { $sum: "$orderItems.quantity" },
					totalRevenue: { $sum: { $multiply: ["$orderItems.quantity", { $subtract: ["$orderItems.price", "$product.basePrice"] }] } },
					orderCount: { $sum: 1 },
				},
			},
			{
				$sort: { totalQuantity: -1 },
			},
			{
				$lookup: {
					from: "products",
					localField: "_id",
					foreignField: "_id",
					as: "product",
				},
			},
			{
				$unwind: "$product",
			},
			{
				$lookup: {
					from: "categories",
					localField: "product.category",
					foreignField: "_id",
					as: "category",
				},
			},
			{
				$unwind: "$category",
			},
		];

		if (categoryId) {
			pipeline.push({
				$match: { "product.category": new mongoose.Types.ObjectId(categoryId) },
			});
		}
		if (subcategoryId) {
			pipeline.push({
				$match: { "product.subcategory": new mongoose.Types.ObjectId(subcategoryId) },
			});
		}

		pipeline.push({
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
						productMarginExpr("$product.price", "$product.basePrice"),
					],
				},
				orderCount: 1,
				averageOrderValue: {
					$cond: [
						{ $eq: ["$orderCount", 0] },
						0,
						{
							$divide: [
								{
									$multiply: [
										"$totalQuantity",
										productMarginExpr("$product.price", "$product.basePrice"),
									],
								},
								"$orderCount",
							],
						},
					],
				},
			},
		});

		const [orderSalesReport, serviceSalesReport] = await Promise.all([
			Order.aggregate(pipeline),
			aggregateServiceProductSales(dateFilter, categoryId, subcategoryId),
		]);

		const salesReport = mergeProductSalesReports(orderSalesReport, serviceSalesReport).slice(
			0,
			parseInt(limit, 10)
		);

		const orderSummary = await Order.aggregate([
			{
				$match: {
					...dateFilter,
					status: { $in: ["Delivered", "Shipped"] },
				},
			},
			{
				$unwind: "$orderItems",
			},
			{
				$lookup: {
					from: "products",
					localField: "orderItems.product",
					foreignField: "_id",
					as: "product",
				},
			},
			{
				$unwind: "$product",
			},
			{
				$group: {
					_id: null,
					totalRevenue: {
						$sum: {
							$multiply: [
								"$orderItems.quantity",
								productMarginExpr("$orderItems.price", "$product.basePrice"),
							],
						},
					},
					totalQuantity: { $sum: "$orderItems.quantity" },
					totalOrders: { $sum: 1 },
				},
			},
		]);

		const serviceSummary = await aggregateServicePartsSummary(dateFilter);
		const orderStats = orderSummary[0] || { totalRevenue: 0, totalQuantity: 0, totalOrders: 0 };

		res.json({
			success: true,
			data: {
				salesReport,
				summary: {
					totalRevenue: orderStats.totalRevenue + serviceSummary.totalRevenue,
					totalQuantity: orderStats.totalQuantity + serviceSummary.totalQuantity,
					totalOrders: orderStats.totalOrders + serviceSummary.totalOrders,
				},
				filters: {
					period: parseInt(period, 10),
					categoryId,
					subcategoryId,
					startDate,
					endDate,
				},
			},
		});

	} catch (error) {
		console.error("Error in getSalesReport:", error);
		res.status(500).json({
			success: false,
			message: "Eroare la generarea raportului de vânzări",
			error: error.message,
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
