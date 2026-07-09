import { create } from "zustand";
import axios from "../lib/axios";

export const useCategoryStore = create((set) => ({
	categories: [],
	loading: false,
	error: null,

	fetchCategories: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/categories");
			set({ categories: response.data, error: null });
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to fetch categories" });
		} finally {
			set({ loading: false });
		}
	},

	addCategory: async (categoryData) => {
		set({ loading: true });
		try {
			const response = await axios.post("/categories", categoryData);
			set((state) => ({
				categories: [...state.categories, response.data],
				error: null
			}));
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to add category" });
			throw error;
		} finally {
			set({ loading: false });
		}
	},

	updateCategory: async (categoryId, categoryData) => {
		set({ loading: true });
		try {
			const response = await axios.put(`/categories/${categoryId}`, categoryData);
			set((state) => ({
				categories: state.categories.map((cat) =>
					cat._id === categoryId ? response.data : cat
				),
				error: null
			}));
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to update category" });
			throw error;
		} finally {
			set({ loading: false });
		}
	},

	deleteCategory: async (categoryId) => {
		set({ loading: true });
		try {
			await axios.delete(`/categories/${categoryId}`);
			set((state) => ({
				categories: state.categories.filter((cat) => cat._id !== categoryId),
				error: null
			}));
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to delete category" });
			throw error;
		} finally {
			set({ loading: false });
		}
	},

	// Subcategory methods
	addSubcategory: (categoryId, newSubcategoryData) => {
		set((state) => ({
			categories: state.categories.map((cat) =>
				cat._id === categoryId
					? { ...cat, subcategories: [...(cat.subcategories || []), newSubcategoryData] }
					: cat
			),
			error: null,
		}));
	},

	updateSubcategory: (categoryId, updatedSubcategoryData) => {
		set((state) => ({
			categories: state.categories.map((cat) =>
				cat._id === categoryId
					? {
							...cat,
							subcategories: cat.subcategories.map((sub) =>
								sub._id === updatedSubcategoryData._id ? updatedSubcategoryData : sub
							),
						}
					: cat
			),
			error: null,
		}));
	},

	deleteSubcategory: (categoryId, subcategoryId) => {
		set((state) => ({
			categories: state.categories.map((cat) =>
				cat._id === categoryId
					? {
							...cat,
							subcategories: cat.subcategories.filter((sub) => sub._id !== subcategoryId),
						}
					: cat
			),
			error: null,
		}));
	},
})); 