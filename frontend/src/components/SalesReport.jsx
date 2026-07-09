import React, { useState, useEffect } from 'react';
import useAnalyticsStore from '../stores/useAnalyticsStore';
import LoadingSpinner from './LoadingSpinner';

const SalesReport = () => {
	const {
		salesReport,
		categories,
		summary,
		filters,
		loading,
		error,
		fetchSalesReport,
		fetchCategories,
		updateFilters,
		resetFilters,
		getProductPercentage,
		formatCurrency,
		formatDate
	} = useAnalyticsStore();

	const [showFilters, setShowFilters] = useState(false);
	const [subcategories, setSubcategories] = useState([]);

	useEffect(() => {
		fetchCategories();
		fetchSalesReport();
	}, []);

	useEffect(() => {
		// Actualizează subcategoriile când se schimbă categoria selectată
		const selectedCategory = categories.find(cat => cat._id === filters.categoryId);
		setSubcategories(selectedCategory?.subcategories || []);
		// Dacă subcategoria selectată nu mai există, resetează-o
		if (!selectedCategory?.subcategories?.find(sub => sub._id === filters.subcategoryId)) {
			handleFilterChange('subcategoryId', '');
		}
	}, [filters.categoryId, categories]);

	const handleFilterChange = (key, value) => {
		updateFilters({ [key]: value });
	};

	const handleApplyFilters = () => {
		fetchSalesReport();
	};

	const handleResetFilters = () => {
		resetFilters();
		fetchSalesReport();
	};

	const getStatusColor = (index) => {
		const colors = [
			'bg-blue-500',
			'bg-green-500', 
			'bg-yellow-500',
			'bg-purple-500',
			'bg-pink-500',
			'bg-indigo-500',
			'bg-red-500',
			'bg-teal-500',
			'bg-orange-500',
			'bg-gray-500'
		];
		return colors[index % colors.length];
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg p-4 sm:p-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-white">Raport Vânzări pe Produse</h2>
					<p className="text-gray-400 mt-1">
						Top {filters.limit} cele mai vândute produse
						{filters.period && ` în ultimele ${filters.period} zile`}
					</p>
				</div>
				<button
					onClick={() => setShowFilters(!showFilters)}
					className="px-4 py-2 bg-[#2B4EE6] text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto shrink-0"
				>
					{showFilters ? 'Ascunde Filtrele' : 'Arată Filtrele'}
				</button>
			</div>

			{/* Filtre */}
			{showFilters && (
				<div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-600">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-1">
								Perioada (zile)
							</label>
							<select
								value={filters.period}
								onChange={(e) => handleFilterChange('period', e.target.value)}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] text-white"
							>
								<option value={7}>Ultimele 7 zile</option>
								<option value={30}>Ultimele 30 zile</option>
								<option value={90}>Ultimele 90 zile</option>
								<option value={180}>Ultimele 6 luni</option>
								<option value={365}>Ultimele 12 luni</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-1">
								Categorie
							</label>
							<select
								value={filters.categoryId}
								onChange={(e) => handleFilterChange('categoryId', e.target.value)}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] text-white"
							>
								<option value="">Toate categoriile</option>
								{categories.map((category) => (
									<option key={category._id} value={category._id}>
										{category.name}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-1">
								Subcategorie
							</label>
							<select
								value={filters.subcategoryId}
								onChange={(e) => handleFilterChange('subcategoryId', e.target.value)}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] text-white"
								disabled={!filters.categoryId || subcategories.length === 0}
							>
								<option value="">Toate subcategoriile</option>
								{subcategories.map((sub) => (
									<option key={sub._id} value={sub._id}>{sub.name}</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-1">
								Data început
							</label>
							<input
								type="date"
								value={filters.startDate}
								onChange={(e) => handleFilterChange('startDate', e.target.value)}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] text-white"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-1">
								Data sfârșit
							</label>
							<input
								type="date"
								value={filters.endDate}
								onChange={(e) => handleFilterChange('endDate', e.target.value)}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] text-white"
							/>
						</div>
					</div>

					<div className="flex gap-2 mt-4">
						<button
							onClick={handleApplyFilters}
							className="px-4 py-2 bg-[#2B4EE6] text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Aplică Filtrele
						</button>
						<button
							onClick={handleResetFilters}
							className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
						>
							Resetează
						</button>
					</div>
				</div>
			)}

			{/* Eroare */}
			{error && (
				<div className="bg-red-900/50 border border-red-400 text-red-200 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			{/* Sumar statistici */}
			{summary && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-blue-900/30 border border-blue-700 p-4 rounded-lg">
						<h3 className="text-lg font-semibold text-blue-300">Venit Total</h3>
						<p className="text-2xl font-bold text-blue-400">
							{formatCurrency(summary.totalRevenue)}
						</p>
					</div>
					<div className="bg-green-900/30 border border-green-700 p-4 rounded-lg">
						<h3 className="text-lg font-semibold text-green-300">Cantitate Totală</h3>
						<p className="text-2xl font-bold text-green-400">
							{summary.totalQuantity} unități
						</p>
					</div>
					<div className="bg-purple-900/30 border border-purple-700 p-4 rounded-lg">
						<h3 className="text-lg font-semibold text-purple-300">Comenzi</h3>
						<p className="text-2xl font-bold text-purple-400">
							{summary.totalOrders}
						</p>
					</div>
				</div>
			)}

			{/* Tabel cu produse */}
			<div className="overflow-x-auto">
				<table className="min-w-full bg-gray-800/30 border border-gray-700 rounded-lg">
					<thead className="bg-gray-700/50">
						<tr>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
								Poziție
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
								Produs
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
								Categorie
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
								Cantitate Vândută
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
								Venit Generat
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
								% din Total
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
								Valoare Medie Comandă
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-700">
						{salesReport.map((product, index) => (
							<tr key={product._id} className="hover:bg-gray-700/30">
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="flex items-center">
										<div className={`w-8 h-8 rounded-full ${getStatusColor(index)} flex items-center justify-center text-white font-bold text-sm`}>
											{index + 1}
										</div>
									</div>
								</td>
								<td className="px-4 py-3">
									<div>
										<div className="text-sm font-medium text-white">
											{product.productName}
										</div>
										<div className="text-sm text-gray-400">
											Preț: {formatCurrency(product.productPrice)}
										</div>
									</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/50 text-blue-300 border border-blue-700">
										{product.categoryName}
									</span>
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
									{product.totalQuantity} unități
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-400">
									{formatCurrency(product.totalRevenue)}
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="flex items-center">
										<div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
											<div 
												className="bg-[#2B4EE6] h-2 rounded-full" 
												style={{ width: `${getProductPercentage(product.totalRevenue)}%` }}
											></div>
										</div>
										<span className="text-sm text-gray-400">
											{getProductPercentage(product.totalRevenue)}%
										</span>
									</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
									{formatCurrency(product.averageOrderValue)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Mesaj când nu sunt date */}
			{salesReport.length === 0 && !loading && (
				<div className="text-center py-8">
					<div className="text-gray-400 text-lg">
						Nu s-au găsit vânzări pentru perioada selectată
					</div>
					<p className="text-gray-500 mt-2">
						Încearcă să modifici filtrele sau să selectezi o perioadă diferită
					</p>
				</div>
			)}
		</div>
	);
};

export default SalesReport; 