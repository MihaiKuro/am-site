import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { Package, ShoppingBag } from 'lucide-react';
import { getDeliveryMethodLabel, getPaymentMethodLabel, getOrderStatusLabel, getOrderStatusClass } from '../lib/orderLabels';

const ProfileOrdersPage = () => {
    const { user } = useUserStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                setError("User not logged in.");
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('/orders/myorders');
                setOrders(response.data.orders || []);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch orders.");
                toast.error(err.response?.data?.message || "Failed to fetch orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-center text-red-500 py-8">Error: {error}</div>;
    }

    return (
        <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg p-4 sm:p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-xl sm:text-2xl font-bold text-[#2B4EE6] mb-4 sm:mb-6">Comenzile mele</h2>
            {
                !orders || orders.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="flex justify-center mb-4">
                            <ShoppingBag className="w-16 h-16 text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-lg mb-4">Nu ai plasat nicio comandă încă.</p>
                        <p className="text-gray-500">Începe să explorezi produsele noastre pentru a face prima achiziție!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-gray-900/50 rounded-lg p-4 sm:p-6 border border-gray-700">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            Comanda #{order._id?.slice(-6) || 'N/A'}
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            Plasată pe {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusClass(order.status)}`}>
                                        {getOrderStatusLabel(order.status, order.deliveryMethod)}
                                    </span>
                                </div>
                                
                                <div className="space-y-4">
                                    {order.orderItems?.map((item) => (
                                        <div key={item._id} className="flex items-center gap-4">
                                            <img 
                                                src={item.product?.image} 
                                                alt={item.product?.name || 'Imagine produs'}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <h4 className="text-white font-medium">{item.product?.name || 'Produs necunoscut'}</h4>
                                                <p className="text-gray-400">Cantitate: {item.quantity || 0}</p>
                                                <p className="text-[#2B4EE6] font-semibold">
                                                    {((item.product?.price || 0) * (item.quantity || 0)).toFixed(2)} RON
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-400">Metodă livrare:</p>
                                            <p className="text-white">{getDeliveryMethodLabel(order.deliveryMethod)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Metodă plată:</p>
                                            <p className="text-white">
                                                {getPaymentMethodLabel(order.paymentMethod, order.deliveryMethod)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                                        <div>
                                            <p className="text-gray-400">
                                                {order.deliveryMethod === 'pickup' ? 'Ridicare:' : 'Adresă de livrare:'}
                                            </p>
                                            <p className="text-white">
                                                {order.deliveryMethod === 'pickup'
                                                    ? 'Din magazinul nostru'
                                                    : order.shippingAddress
                                                        ? `${order.shippingAddress.street || 'Nespecificată'}, ${order.shippingAddress.city || 'Nespecificat'}`
                                                        : 'Nespecificată'}
                                            </p>
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="text-gray-400">Total:</p>
                                            <p className="text-2xl font-bold text-[#2B4EE6]">
                                                {order.totalPrice ? `${order.totalPrice.toFixed(2)} RON` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </motion.div>
    );
};

export default ProfileOrdersPage; 