import { create } from 'zustand';
import axios from '../lib/axios';

const useAnalyticsStore = create((set, get) => ({
	// State
	salesReport: [],
	categories: [],
	summary: null,
	filters: {
		period: 30,
		categoryId: '',
		subcategoryId: '',
		startDate: '',
		endDate: '',
		limit: 10
	},
	loading: false,
	error: null,

	// Actions
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),

	// Obține raportul de vânzări
	fetchSalesReport: async (filters = {}) => {
		try {
			set({ loading: true, error: null });
			
			const currentFilters = { ...get().filters, ...filters };
			set({ filters: currentFilters });

			const params = new URLSearchParams();
			if (currentFilters.period) params.append('period', currentFilters.period);
			if (currentFilters.categoryId) params.append('categoryId', currentFilters.categoryId);
			if (currentFilters.subcategoryId && currentFilters.subcategoryId !== '') params.append('subcategoryId', currentFilters.subcategoryId);
			if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
			if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);
			if (currentFilters.limit) params.append('limit', currentFilters.limit);

			const response = await axios.get(`/analytics/sales-report?${params}`);
			
			if (response.data.success) {
				set({
					salesReport: response.data.data.salesReport,
					summary: response.data.data.summary,
					loading: false
				});
			} else {
				set({ 
					error: response.data.message || 'Eroare la obținerea raportului',
					loading: false 
				});
			}
		} catch (error) {
			console.error('Error fetching sales report:', error);
			set({ 
				error: error.response?.data?.message || 'Eroare la obținerea raportului',
				loading: false 
			});
		}
	},

	// Obține categoriile pentru filtrare
	fetchCategories: async () => {
		try {
			const response = await axios.get('/analytics/categories-filter');
			
			if (response.data.success) {
				set({ categories: response.data.data });
			}
		} catch (error) {
			console.error('Error fetching categories:', error);
		}
	},

	// Actualizează filtrele
	updateFilters: (newFilters) => {
		set(state => ({
			filters: { ...state.filters, ...newFilters }
		}));
	},

	// Resetează filtrele
	resetFilters: () => {
		set({
			filters: {
				period: 30,
				categoryId: '',
				subcategoryId: '',
				startDate: '',
				endDate: '',
				limit: 10
			}
		});
	},

	// Calculează procentul din total pentru fiecare produs
	getProductPercentage: (productRevenue) => {
		const { summary } = get();
		if (!summary || summary.totalRevenue === 0) return 0;
		return ((productRevenue / summary.totalRevenue) * 100).toFixed(1);
	},

	// Formatează suma în lei
	formatCurrency: (amount) => {
		return new Intl.NumberFormat('ro-RO', {
			style: 'currency',
			currency: 'RON'
		}).format(amount);
	},

	// Formatează data
	formatDate: (dateString) => {
		return new Date(dateString).toLocaleDateString('ro-RO');
	}
}));

export default useAnalyticsStore; 