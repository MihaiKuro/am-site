import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOrderStore } from "../stores/useOrderStore";
import LoadingSpinner from "./LoadingSpinner";
import { Filter, Trash } from "lucide-react";
import useAnalyticsStore from '../stores/useAnalyticsStore';
import axios from '../lib/axios';
import { getDeliveryMethodLabel, getPaymentMethodLabel, getOrderStatusLabel, getOrderStatusOptions, getOrderStatusClass, FILTER_STATUS_OPTIONS } from '../lib/orderLabels';

const OrdersList = () => {
	const { orders, loading, error, fetchAllOrders, fetchFilteredOrders, updateOrderStatus, deleteOrder } = useOrderStore();
	const { fetchSalesReport } = useAnalyticsStore();

	const [showFilters, setShowFilters] = useState(false);
	const [filterStatus, setFilterStatus] = useState('');
	const [filterClientName, setFilterClientName] = useState('');
	const [filterStartDate, setFilterStartDate] = useState('');
	const [filterEndDate, setFilterEndDate] = useState('');
	const [editingStatusId, setEditingStatusId] = useState(null);

	const getUserLabel = (user) => {
		if (!user) return "—";
		if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
		return user.email || "—";
	};

	const getStatusClass = (status) => getOrderStatusClass(status);

	const handleStatusChange = async (orderId, currentStatus, newStatus) => {
		if (newStatus !== currentStatus) {
			await updateOrderStatus(orderId, newStatus);
			await fetchSalesReport();
			await fetchAnalyticsData();
		}
		setEditingStatusId(null);
	};

	const handleDeleteOrder = async (orderId) => {
		if (!window.confirm("Sigur vrei să ștergi această comandă?")) return;
		await deleteOrder(orderId);
		await fetchSalesReport();
		await fetchAnalyticsData();
	};

	const renderStatusControl = (order, { mobile = false } = {}) => {
		const statusOptions = getOrderStatusOptions(order.deliveryMethod);

		if (mobile || editingStatusId === order._id) {
			return (
				<select
					autoFocus={!mobile && editingStatusId === order._id}
					value={order.status}
					onChange={async (e) => handleStatusChange(order._id, order.status, e.target.value)}
					onBlur={() => setEditingStatusId(null)}
					className="w-full px-2 py-1.5 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm"
				>
					{statusOptions.map(([en, ro]) => (
						<option key={en} value={en}>{ro}</option>
					))}
				</select>
			);
		}

		return (
			<span
				onClick={() => setEditingStatusId(order._id)}
				className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:ring-2 hover:ring-[#2B4EE6] ${getStatusClass(order.status)}`}
				title={order.deliveryMethod === 'pickup' ? 'Status ridicare din magazin' : 'Status livrare curier'}
			>
				{getOrderStatusLabel(order.status, order.deliveryMethod)}
			</span>
		);
	};
	useEffect(() => {
		fetchAllOrders();
	}, [fetchAllOrders]);

	const applyOrderFilters = async () => {
		const filters = {};
		if (filterStatus) {
			filters.status = filterStatus;
		}
		if (filterClientName.trim()) {
			filters.clientName = filterClientName.trim();
		}
		if (filterStartDate) {
			filters.startDate = filterStartDate;
		}
		if (filterEndDate) {
			filters.endDate = filterEndDate;
		}

		await fetchFilteredOrders(filters);
	};

	const handleClearAllFilters = async () => {
		setFilterStatus('');
		setFilterClientName('');
		setFilterStartDate('');
		setFilterEndDate('');
		await fetchAllOrders();
	};

	// Funcție locală pentru refetch sumar general
	const fetchAnalyticsData = async () => {
		try {
			await axios.get("/analytics");
		} catch (error) {
			console.error("Error fetching analytics data:", error);
		}
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return <div className='text-center text-red-500 py-8'>Error: {error}</div>;
	}

	return (
		<motion.div
			className='bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg overflow-hidden p-4 sm:p-5 flex flex-col'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<h2 className='text-lg sm:text-2xl font-semibold mb-4 sm:mb-6 text-[#2B4EE6]'>Comenzi</h2>

			<div className='mb-4'>
				<motion.button
					onClick={() => setShowFilters(!showFilters)}
					className='inline-flex items-center justify-center w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium
					text-white bg-[#2B4EE6] hover:bg-blue-600 focus:outline-none focus:ring-2
					focus:ring-offset-2 focus:ring-[#2B4EE6] transition-colors duration-200'
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<Filter className='h-5 w-5 mr-2' />
					{showFilters ? 'Ascunde filtrele' : 'Afișează filtrele'}
				</motion.button>
			</div>

			{showFilters && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: 'auto' }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.3 }}
					className='bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-4 space-y-4'
				>
					<h3 className='text-lg font-semibold text-gray-300'>Filtrează comenzile</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						<div>
							<label htmlFor='statusFilter' className='block text-sm font-medium text-gray-400'>Status</label>
							<select
								id='statusFilter'
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
							>
								<option value=''>Toate statusurile</option>
								{FILTER_STATUS_OPTIONS.map(([en, ro]) => (
									<option key={en} value={en}>{ro}</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor='clientNameFilter' className='block text-sm font-medium text-gray-400'>Nume client</label>
							<input
								type='text'
								id='clientNameFilter'
								value={filterClientName}
								onChange={(e) => setFilterClientName(e.target.value)}
								placeholder='Caută după nume client'
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
							/>
						</div>
						<div>
							<label htmlFor='startDateFilter' className='block text-sm font-medium text-gray-400'>Data de început</label>
							<input
								type='date'
								id='startDateFilter'
								value={filterStartDate}
								onChange={(e) => setFilterStartDate(e.target.value)}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
							/>
						</div>
						<div>
							<label htmlFor='endDateFilter' className='block text-sm font-medium text-gray-400'>Data de sfârșit</label>
							<input
								type='date'
								id='endDateFilter'
								value={filterEndDate}
								onChange={(e) => setFilterEndDate(e.target.value)}
								className='mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-md py-2 px-3 text-white'
							/>
						</div>
					</div>
					<div className='flex flex-col sm:flex-row justify-end gap-3 pt-4'>
						<motion.button
							onClick={handleClearAllFilters}
							className='py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium
							text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							focus:ring-gray-500 transition-colors duration-200 w-full sm:w-auto'
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Șterge filtrele
						</motion.button>
						<motion.button
							onClick={applyOrderFilters}
							className='py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium
							text-white bg-[#2B4EE6] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2
							focus:ring-[#2B4EE6] transition-colors duration-200 w-full sm:w-auto'
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Aplică filtrele
						</motion.button>
					</div>
				</motion.div>
			)}

			{orders.length === 0 ? (
				<div className="text-center text-gray-400 py-8 text-sm">Nu am găsit comenzi.</div>
			) : (
				<>
					{/* Mobile: cards */}
					<div className="md:hidden space-y-3">
						{orders.map((order) => (
							<div
								key={order._id}
								className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 space-y-3"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="text-white text-sm font-medium">
											Comandă #{order._id.slice(-8)}
										</p>
										<p className="text-gray-400 text-xs mt-1">
											{order.createdAt ? new Date(order.createdAt).toLocaleString("ro-RO") : "—"}
										</p>
									</div>
									<p className="text-[#2B4EE6] font-semibold text-sm shrink-0">
										{typeof order.totalPrice === "number" ? `${order.totalPrice.toFixed(2)} RON` : "—"}
									</p>
								</div>

								<div className="space-y-1.5 text-sm">
									<p className="text-gray-300">
										<span className="text-gray-500">Client: </span>
										{getUserLabel(order.user)}
									</p>
									<p className="text-gray-300">
										<span className="text-gray-500">Livrare: </span>
										{getDeliveryMethodLabel(order.deliveryMethod)}
									</p>
									<p className="text-gray-300">
										<span className="text-gray-500">Plată: </span>
										{getPaymentMethodLabel(order.paymentMethod, order.deliveryMethod)}
										{order.isPaid ? (
											<span className="text-green-400 ml-2">· Achitată</span>
										) : (
											<span className="text-yellow-400 ml-2">· Neachitată</span>
										)}
									</p>
								</div>

								<div>
									<label className="block text-xs text-gray-500 mb-1">Status</label>
									{renderStatusControl(order, { mobile: true })}
								</div>

								<button
									onClick={() => handleDeleteOrder(order._id)}
									className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm"
								>
									<Trash className="h-4 w-4" />
									Șterge comanda
								</button>
							</div>
						))}
					</div>

					{/* Desktop: table */}
					<div className='hidden md:block overflow-x-auto overflow-y-auto flex-grow max-h-[calc(100vh-350px)]'>
				<table className='min-w-full divide-y divide-gray-700'>
					<thead className='bg-gray-900/50 sticky top-0 z-10'>
						<tr>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								ID Comandă
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Utilizator
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Dată
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Total
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Status
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Livrare
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Metodă plată
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
								Plătită
							</th>
							<th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Acțiuni</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-700 bg-transparent'>
						{orders.map((order) => (
							<motion.tr
								key={order._id}
								className='hover:bg-gray-700/30 transition-colors duration-200'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								layout
							>
								<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-white'>
									{order._id}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
									{getUserLabel(order.user)}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
									{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-[#2B4EE6] font-semibold'>
									{typeof order.totalPrice === 'number' ? order.totalPrice.toFixed(2) : '—'} RON
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									{renderStatusControl(order)}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
									{getDeliveryMethodLabel(order.deliveryMethod)}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
									{getPaymentMethodLabel(order.paymentMethod, order.deliveryMethod)}
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									{order.isPaid ? (
										<span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
											Plătită
										</span>
									) : (
										<span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'>
											Neplătită
										</span>
									)}
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<button
										onClick={() => handleDeleteOrder(order._id)}
										className='text-red-500 hover:text-red-700 transition-colors p-1 rounded'
										title='Șterge Comanda'
									>
										<Trash className='h-5 w-5' />
									</button>
								</td>
							</motion.tr>
						))}
					</tbody>
				</table>
					</div>
				</>
			)}
		</motion.div>
	);
};

export default OrdersList; 