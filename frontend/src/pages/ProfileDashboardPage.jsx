import { motion } from "framer-motion";
import { ShoppingBag, Car, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useOrderStore } from "../stores/useOrderStore";
import { useEffect, useState } from "react";
import axios from "../lib/axios";

const DashboardCard = ({ icon: Icon, title, value, link, color }) => (
    <Link to={link}>
        <motion.div
            className={`bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm">{title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </motion.div>
    </Link>
);

const ProfileDashboardPage = () => {
    const { user } = useUserStore();
    const { orders, fetchMyOrders, loading } = useOrderStore();
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);

    useEffect(() => {
        fetchMyOrders();
        const fetchAppointments = async () => {
            setLoadingAppointments(true);
            try {
                const res = await axios.get("/appointments/my");
                setAppointments(res.data.appointments || []);
            } catch {
                setAppointments([]);
            } finally {
                setLoadingAppointments(false);
            }
        };
        fetchAppointments();
    }, [fetchMyOrders]);

    // Define order status constants for clarity
    const ORDER_STATUS_PENDING = 'Pending';
    const ORDER_STATUS_SHIPPED = 'Shipped';
    const ORDER_STATUS_DELIVERED = 'Delivered';
    const ORDER_STATUS_CANCELLED = 'Cancelled';

    // Helper functions for status groupings
    const isPendingOrder = (status) => status === ORDER_STATUS_PENDING || status === ORDER_STATUS_SHIPPED; // Pending includes both 'Pending' and 'Shipped' orders, as both are not yet delivered
    const isDeliveredOrder = (status) => status === ORDER_STATUS_DELIVERED; // Delivered orders
    const isCancelledOrder = (status) => status === ORDER_STATUS_CANCELLED; // Cancelled orders

    // Filtrare pe status
    const pendingCount = orders.filter(o => isPendingOrder(o.status)).length;
    const deliveredCount = orders.filter(o => isDeliveredOrder(o.status)).length;
    const cancelledCount = orders.filter(o => isCancelledOrder(o.status)).length;

    const stats = [
        {
            icon: ShoppingBag,
            title: "Comenzi în Așteptare",
            value: loading ? '...' : pendingCount,
            link: "/profile/orders",
            color: "bg-blue-600",
        },
        {
            icon: ShoppingBag,
            title: "Comenzi Livrate",
            value: loading ? '...' : deliveredCount,
            link: "/profile/orders",
            color: "bg-green-600",
        },
        {
            icon: ShoppingBag,
            title: "Comenzi Anulate",
            value: loading ? '...' : cancelledCount,
            link: "/profile/orders",
            color: "bg-red-600",
        },
        {
            icon: MapPin,
            title: "Adrese Salvate",
            value: user?.addresses?.length ?? 0,
            link: "/profile/addresses",
            color: "bg-orange-600",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Panou Principal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                    <DashboardCard key={index} {...stat} />
                ))}
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">Activitate Recentă</h3>
                <div className="bg-gray-700 rounded-lg divide-y divide-gray-600">
                    {/* Comenzi */}
                    {orders.slice(0, 3).map((order) => (
                        <div className="p-4" key={order._id}>
                            <p className="text-white">Comandă plasată - {order.totalPrice?.toFixed(2)} RON</p>
                            <p className="text-sm text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</p>
                        </div>
                    ))}
                    {/* Programări */}
                    {appointments.slice(0, 3).map((appt) => (
                        <div className="p-4" key={appt._id}>
                            <p className="text-white">Programare service {appt.status === "Confirmată" ? "confirmată" : appt.status === "Anulată" ? "anulată" : "înregistrată"} ({appt.serviceType})</p>
                            <p className="text-sm text-gray-400">{appt.date ? new Date(appt.date).toLocaleString() : ""}</p>
                        </div>
                    ))}
                    {/* Vehicule */}
                    {user?.vehicles && user.vehicles.slice(0, 1).map((v, idx) => (
                        <div className="p-4" key={v._id || idx}>
                            <p className="text-white">Vehicul nou adăugat: {v.model || v.make || "Vehicul"}</p>
                            <p className="text-sm text-gray-400">{v.createdAt ? new Date(v.createdAt).toLocaleString() : ""}</p>
                        </div>
                    ))}
                    {(orders.length === 0 && appointments.length === 0 && (!user?.vehicles || user.vehicles.length === 0)) && (
                        <div className="p-4 text-gray-400">Nicio activitate recentă.</div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">Acțiuni Rapide</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/profile/appointments">
                        <motion.button
                            className="w-full p-4 bg-[#2B4EE6] text-white rounded-lg hover:bg-blue-600 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Programează Service
                        </motion.button>
                    </Link>
                    <Link to="/profile/vehicles/">
                        <motion.button
                            className="w-full p-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Adaugă Vehicul
                        </motion.button>
                    </Link>
                    <Link to="/profile/vehicles">
                        <motion.button
                            className="w-full p-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Vehiculele Mele
                        </motion.button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboardPage;