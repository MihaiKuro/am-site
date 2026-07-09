import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
	products: [],
	loading: false,
	error: null,

	setProducts: (products) => set({ products }),
	createProduct: async (productData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/products", productData);
			set((state) => ({
				products: [...state.products, res.data],
				loading: false,
				error: null
			}));
			return res.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to create product";
			set({ error: errorMessage, loading: false });
			throw error;
		}
	},
	updateProduct: async (productId, productData) => {
		set({ loading: true });
		try {
			const res = await axios.put(`/products/${productId}`, productData);
			set((state) => ({
				products: state.products.map((product) =>
					product._id === productId ? res.data : product
				),
				loading: false,
				error: null
			}));
			return res.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to update product";
			set({ error: errorMessage, loading: false });
			throw error;
		}
	},
	fetchAllProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products");
			set({ products: response.data.products, loading: false, error: null });
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to fetch products";
			set({ error: errorMessage, loading: false });
			toast.error(errorMessage);
		}
	},
	fetchProductsByCategory: async (category) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/products/category/${category}`);
			set({ products: response.data.products, loading: false, error: null });
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to fetch products";
			set({ error: errorMessage, loading: false });
			toast.error(errorMessage);
		}
	},
	fetchProductsBySubcategory: async (subcategory) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/products/subcategory/${subcategory}`);
			set({ products: response.data.products, loading: false, error: null });
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to fetch products";
			set({ error: errorMessage, loading: false });
			toast.error(errorMessage);
		}
	},
	deleteProduct: async (productId) => {
		set({ loading: true });
		try {
			await axios.delete(`/products/${productId}`);
			set((state) => ({
				products: state.products.filter((product) => product._id !== productId),
				loading: false,
				error: null
			}));
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to delete product";
			set({ error: errorMessage, loading: false });
			toast.error(errorMessage);
		}
	},
	toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}`);
			set((state) => ({
				products: state.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
				error: null
			}));
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to update product";
			set({ error: errorMessage, loading: false });
			toast.error(errorMessage);
		}
	},
	fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products/featured");
			set({ products: response.data.filter((p) => p.stock > 0), loading: false, error: null });
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to fetch featured products";
			set({ error: errorMessage, loading: false });
			console.error("Error fetching featured products:", error);
		}
	},
	fetchFilteredProducts: async (filters) => {
		set({ loading: true });
		try {
			const queryParams = new URLSearchParams(filters).toString();
			const response = await axios.get(`/products?${queryParams}`);
			set({ products: response.data.products, loading: false, error: null });
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to fetch filtered products";
			set({ error: errorMessage, loading: false });
			toast.error(errorMessage);
		}
	},
}));
