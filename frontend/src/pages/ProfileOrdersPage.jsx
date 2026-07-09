import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { Package, ShoppingBag } from 'lucide-react';

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
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-3xl font-bold text-[#2B4EE6] mb-6">Comenzile mele</h2>
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
                            <div key={order._id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            Comanda #{order._id?.slice(-6) || 'N/A'}
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            Plasată pe {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {order.status === 'Pending' ? 'În așteptare' :
                                         order.status === 'Shipped' ? 'Expediată' :
                                         order.status === 'Delivered' ? 'Livrată' :
                                         order.status === 'Cancelled' ? 'Anulată' :
                                         'Necunoscut'}
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

                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-400">Adresă de livrare:</p>
                                            <p className="text-white">
                                                {order.shippingAddress ? 
                                                    `${order.shippingAddress.street || 'Nespecificată'}, ${order.shippingAddress.city || 'Nespecificat'}` :
                                                    'Plată online - fără adresă, Online'
                                                }
                                            </p>
                                        </div>
                                        <div className="text-right">
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