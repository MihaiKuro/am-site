import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign, BarChart3, Wrench } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import SalesReport from "./SalesReport";

const AnalyticsTab = () => {
	const [analyticsData, setAnalyticsData] = useState({
		users: 0,
		products: 0,
		totalSales: 0,
		totalRevenue: 0,
		cancelledOrders: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [dailySalesData, setDailySalesData] = useState([]);
	const [activeView, setActiveView] = useState("overview"); // "overview", "sales-report", "service-summary"
	const [serviceSummary, setServiceSummary] = useState(null);
	const [serviceLoading, setServiceLoading] = useState(false);
	const [serviceError, setServiceError] = useState(null);
	const [serviceStartDate, setServiceStartDate] = useState("");
	const [serviceEndDate, setServiceEndDate] = useState("");
	const [chartHeight, setChartHeight] = useState(400);

	useEffect(() => {
		const updateChartHeight = () => {
			setChartHeight(window.innerWidth < 640 ? 260 : 400);
		};
		updateChartHeight();
		window.addEventListener("resize", updateChartHeight);
		return () => window.removeEventListener("resize", updateChartHeight);
	}, []);

	useEffect(() => {
		const fetchAnalyticsData = async () => {
			try {
				const response = await axios.get("/analytics");
				setAnalyticsData(response.data.analyticsData);
				setDailySalesData(response.data.dailySalesData);
			} catch (error) {
				console.error("Error fetching analytics data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAnalyticsData();
	}, []);

	const fetchServiceSummary = async (startDate, endDate) => {
		setServiceLoading(true);
		setServiceError(null);
		try {
			const params = {};
			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;
			const response = await axios.get("/analytics/service-summary", { params });
			setServiceSummary(response.data.data);
		} catch (error) {
			setServiceError("Eroare la încărcarea raportului service");
		} finally {
			setServiceLoading(false);
		}
	};

	useEffect(() => {
		if (activeView === "service-summary") {
			fetchServiceSummary(serviceStartDate, serviceEndDate);
		}
	}, [activeView, serviceStartDate, serviceEndDate]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[400px] text-gray-400">
				Loading analytics...
			</div>
		);
	}

	return (
		<div className='max-w-7xl mx-auto px-2 sm:px-6 lg:px-8'>
			{/* Mobile: dropdown */}
			<div className="lg:hidden mb-6">
				<label htmlFor="analytics-view-select" className="sr-only">Vizualizare analitice</label>
				<select
					id="analytics-view-select"
					value={activeView}
					onChange={(e) => setActiveView(e.target.value)}
					className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]"
				>
					<option value="overview">Vizualizare Generală</option>
					<option value="sales-report">Raport Vânzări pe Produse</option>
					<option value="service-summary">Raport General Service</option>
				</select>
			</div>

			{/* Desktop: view buttons */}
			<div className="hidden lg:flex flex-wrap justify-center gap-3 mb-8">
				<motion.button
					onClick={() => setActiveView("overview")}
					className={`flex items-center px-4 xl:px-6 py-2.5 xl:py-3 rounded-lg transition-all duration-200 text-sm xl:text-base ${
						activeView === "overview"
							? "bg-[#2B4EE6] text-white shadow-lg shadow-blue-500/20"
							: "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700"
					}`}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<BarChart3 className='mr-2 h-5 w-5' />
					Vizualizare Generală
				</motion.button>
				<motion.button
					onClick={() => setActiveView("sales-report")}
					className={`flex items-center px-4 xl:px-6 py-2.5 xl:py-3 rounded-lg transition-all duration-200 text-sm xl:text-base ${
						activeView === "sales-report"
							? "bg-[#2B4EE6] text-white shadow-lg shadow-blue-500/20"
							: "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700"
					}`}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<ShoppingCart className='mr-2 h-5 w-5' />
					Raport Vânzări pe Produse
				</motion.button>
				<motion.button
					onClick={() => setActiveView("service-summary")}
					className={`flex items-center px-4 xl:px-6 py-2.5 xl:py-3 rounded-lg transition-all duration-200 text-sm xl:text-base ${
						activeView === "service-summary"
							? "bg-[#2B4EE6] text-white shadow-lg shadow-blue-500/20"
							: "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700"
					}`}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<Wrench className='mr-2 h-5 w-5' />
					Raport General Service
				</motion.button>
			</div>

			{/* Conținut în funcție de vizualizarea activă */}
			{activeView === "overview" ? (
				<>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
						<AnalyticsCard
							title='Utilizatori totali'
							value={analyticsData.users.toLocaleString()}
							icon={Users}
							color='from-[#2B4EE6] to-blue-900'
						/>
						<AnalyticsCard
							title='Produse totale'
							value={analyticsData.products.toLocaleString()}
							icon={Package}
							color='from-[#2B4EE6] to-indigo-900'
						/>
						<AnalyticsCard
							title='Vânzări totale'
							value={analyticsData.totalSales.toLocaleString()}
							icon={ShoppingCart}
							color='from-[#2B4EE6] to-blue-900'
						/>
						<AnalyticsCard
							title='Venit total'
							value={`${analyticsData.totalRevenue.toLocaleString()} ron`}
							icon={DollarSign}
							color='from-[#2B4EE6] to-indigo-900'
						/>
						<AnalyticsCard
							title='Comenzi Anulate'
							value={analyticsData.cancelledOrders?.toLocaleString?.() ?? analyticsData.cancelledOrders ?? 0}
							icon={ShoppingCart}
							color='from-red-500 to-red-900'
						/>
					</div>
					<motion.div
						className='bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 sm:p-6 shadow-lg'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.25 }}
					>
						<ResponsiveContainer width='100%' height={chartHeight}>
							<LineChart data={dailySalesData}>
								<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
								<XAxis dataKey='date' stroke='#9CA3AF' />
								<YAxis yAxisId='left' stroke='#9CA3AF' />
								<YAxis yAxisId='right' orientation='right' stroke='#9CA3AF' />
								<Tooltip 
									contentStyle={{ 
										backgroundColor: '#1F2937', 
										border: '1px solid #374151',
										borderRadius: '0.5rem'
									}}
									labelStyle={{ color: '#9CA3AF' }}
									itemStyle={{ color: '#E5E7EB' }}
								/>
								<Legend />
								<Line
									yAxisId='left'
									type='monotone'
									dataKey='sales'
									stroke='#2B4EE6'
									strokeWidth={2}
									activeDot={{ r: 8 }}
									name='Vânzări'
								/>
								<Line
									yAxisId='right'
									type='monotone'
									dataKey='revenue'
									stroke='#60A5FA'
									strokeWidth={2}
									activeDot={{ r: 8 }}
									name='Venituri'
								/>
								<Line
									yAxisId='left'
									type='monotone'
									dataKey='cancelled'
									stroke='#EF4444'
									strokeWidth={2}
									dot={{ r: 6 }}
									name='Anulate'
								/>
							</LineChart>
						</ResponsiveContainer>
					</motion.div>
				</>
			) : activeView === "service-summary" ? (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-lg mb-8">
						<h2 className="text-2xl font-bold text-white mb-4">Raport General Service</h2>
						<div className="flex flex-wrap gap-4 mb-4">
							<div>
								<label className="text-gray-300 text-sm mr-2">Data început</label>
								<input type="date" value={serviceStartDate} onChange={e => setServiceStartDate(e.target.value)} className="bg-gray-900/50 border border-gray-700 rounded px-2 py-1 text-white" />
							</div>
							<div>
								<label className="text-gray-300 text-sm mr-2">Data sfârșit</label>
								<input type="date" value={serviceEndDate} onChange={e => setServiceEndDate(e.target.value)} className="bg-gray-900/50 border border-gray-700 rounded px-2 py-1 text-white" />
							</div>
						</div>
						{serviceLoading ? (
							<div className="text-gray-400">Se încarcă...</div>
						) : serviceError ? (
							<div className="text-red-400">{serviceError}</div>
						) : serviceSummary ? (
							<>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
									<AnalyticsCard title="Vehicule în Service" value={serviceSummary.vehiclesCount} icon={Wrench} color="from-green-400 to-green-900" />
									<AnalyticsCard title="Valoare Medie Comandă" value={serviceSummary.avgOrder?.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' RON'} icon={DollarSign} color="from-blue-400 to-blue-900" />
									<AnalyticsCard title="Încasări Service" value={serviceSummary.totalRevenue?.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' RON'} icon={DollarSign} color="from-indigo-400 to-indigo-900" />
									<AnalyticsCard title="Top Intervenții" value={serviceSummary.interventions?.map(i => i._id).join(', ') || '-'} icon={BarChart3} color="from-yellow-400 to-yellow-900" />
								</div>
								<div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 overflow-x-auto">
									<h3 className="text-lg font-semibold text-white mb-2">Grad Încărcare Mecanici</h3>
									{serviceSummary.mechanicLoad?.length === 0 ? (
										<div className="text-gray-400">Nu există date pentru perioada selectată.</div>
									) : (
										<table className="min-w-full divide-y divide-gray-700">
											<thead>
												<tr>
													<th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mecanic</th>
													<th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nr. Fișe</th>
												</tr>
											</thead>
											<tbody>
												{serviceSummary.mechanicLoad.map((m, idx) => (
													<tr key={idx}>
														<td className="px-4 py-2 text-white">{m._id || 'N/A'}</td>
														<td className="px-4 py-2 text-white">{m.count}</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							</>
						) : null}
					</div>
				</motion.div>
			) : (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<SalesReport />
				</motion.div>
			)}
		</div>
	);
};

export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
	<motion.div
		className='bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-lg overflow-hidden relative'
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
	>
		<div className='flex justify-between items-center'>
			<div className='z-10'>
				<p className='text-[#2B4EE6] text-sm mb-1 font-semibold'>{title}</p>
				<h3 className='text-white text-3xl font-bold'>{value}</h3>
			</div>
		</div>
		<div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
		<div className='absolute -bottom-4 -right-4 text-[#2B4EE6] opacity-20'>
			<Icon className='h-32 w-32' />
		</div>
	</motion.div>
);
