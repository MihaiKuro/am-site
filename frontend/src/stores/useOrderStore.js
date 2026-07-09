import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useOrderStore = create((set) => ({
	orders: [],
	loading: false,
	error: null,

	setOrders: (orders) => set({ orders }),

	fetchFilteredOrders: async (filters) => {
		set({ loading: true, error: null });
		try {
			const queryParams = new URLSearchParams(filters).toString();
			const response = await axios.get(`/orders?${queryParams}`);
			set({ orders: response.data.orders, loading: false });
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to fetch filtered orders";
			set({ error: errorMessage, loading: false });
			toast.error(errorMessage);
		}
	},

	fetchAllOrders: async () => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get("/orders");
			set({ orders: response.data.orders, loading: false });
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to fetch orders";
			set({ error: errorMessage, loading: false });
			toast.error(errorMessage);
		}
	},

	updateOrderStatus: async (orderId, status) => {
		try {
			const response = await axios.put(`/orders/${orderId}/status`, { status });
			if (response.data.success) {
				set((state) => ({
					orders: state.orders.map((order) =>
						order._id === orderId ? response.data.order : order
					),
				}));
			}
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to update order status";
			toast.error(errorMessage);
			throw error;
		}
	},

	fetchMyOrders: async () => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get("/orders/myorders");
			set({ orders: response.data.orders, loading: false });
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to fetch your orders";
			set({ error: errorMessage, loading: false });
			toast.error(errorMessage);
		}
	},

	deleteOrder: async (orderId) => {
		set({ loading: true, error: null });
		try {
			await axios.delete(`/orders/${orderId}`);
			set((state) => ({
				orders: state.orders.filter((order) => order._id !== orderId),
				loading: false
			}));
			toast.success("Order deleted successfully");
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to delete order";
			set({ error: errorMessage, loading: false });
			toast.error(errorMessage);
		}
	},
})); 