import { BarChart, PlusCircle, ShoppingBasket, Grid, Package, User, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import CategoriesTab from "../components/CategoriesTab";
import OrdersList from "../components/OrdersList";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";
import MechanicsAdmin from "../components/MechanicsAdmin";
import AppointmentsList from "../components/AppointmentsList";

const tabs = [
	{ id: "create", label: "Adaugă Produs", icon: PlusCircle },
	{ id: "products", label: "Produse", icon: ShoppingBasket },
	{ id: "categories", label: "Categorii", icon: Grid },
	{ id: "orders", label: "Comenzi", icon: Package },
	{ id: "analytics", label: "Analitice", icon: BarChart },
	{ id: "mechanics", label: "Mecanici", icon: User },
	{ id: "appointments", label: "Programări", icon: Calendar },
];

const AdminPage = () => {
	const [activeTab, setActiveTab] = useState("create");
	const { fetchAllProducts } = useProductStore();
	const { user } = useUserStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			navigate("/login");
			return;
		}

		if (user.role !== "admin") {
			navigate("/");
			return;
		}

		fetchAllProducts();
	}, [fetchAllProducts, user, navigate]);

	// Show loading or redirect if not admin
	if (!user || user.role !== "admin") {
		return null;
	}

	return (
		<div className='min-h-screen bg-[#0B0F17]'>
			<div className='relative z-10 container mx-auto px-4 py-6 sm:py-12'>
				<motion.h1
					className='text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-[#2B4EE6] text-center'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					Admin Dashboard
				</motion.h1>

				{/* Mobile: dropdown */}
				<div className='lg:hidden mb-6'>
					<label htmlFor='admin-tab-select' className='sr-only'>Secțiune admin</label>
					<select
						id='admin-tab-select'
						value={activeTab}
						onChange={(e) => setActiveTab(e.target.value)}
						className='w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]'
					>
						{tabs.map((tab) => (
							<option key={tab.id} value={tab.id}>{tab.label}</option>
						))}
					</select>
				</div>

				{/* Desktop: tab buttons */}
				<div className='hidden lg:flex flex-wrap justify-center gap-3 mb-8'>
					{tabs.map((tab) => (
						<motion.button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center px-4 xl:px-6 py-2.5 xl:py-3 rounded-lg transition-all duration-200 text-sm xl:text-base ${
								activeTab === tab.id
									? "bg-[#2B4EE6] text-white shadow-lg shadow-blue-500/20"
									: "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700"
							}`}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<tab.icon className='mr-2 h-5 w-5 shrink-0' />
							{tab.label}
						</motion.button>
					))}
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					{activeTab === "create" && <CreateProductForm />}
					{activeTab === "products" && <ProductsList />}
					{activeTab === "categories" && <CategoriesTab />}
					{activeTab === "orders" && <OrdersList />}
					{activeTab === "analytics" && <AnalyticsTab />}
					{activeTab === "mechanics" && <MechanicsAdmin />}
					{activeTab === "appointments" && <AppointmentsList />}
				</motion.div>
			</div>
		</div>
	);
};

export default AdminPage;
