import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			min: 0,
			required: true,
		},
		basePrice: {
			type: Number,
			min: 0,
			required: false,
		},
		image: {
			type: String,
			required: [true, "Image is required"],
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
			required: true,
		},
		subcategory: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		stock: {
			type: Number,
			required: true,
			min: 0,
			default: 0,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
