import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import {
    User,
    MapPin,
    ShoppingBag,
    Car,
    Calendar,
    Heart,
    LayoutDashboard,
    ChevronRight,
    Menu,
    X
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const menuItems = [
    { icon: LayoutDashboard, label: "Panou Principal", path: "/profile" },
    { icon: User, label: "Detalii Personale", path: "/profile/details" },
    { icon: MapPin, label: "Adresele Mele", path: "/profile/addresses" },
    { icon: ShoppingBag, label: "Comenzile Mele", path: "/profile/orders" },
    { icon: Car, label: "Vehiculele Mele", path: "/profile/vehicles" },
    { icon: Calendar, label: "Programări Service", path: "/profile/appointments" },
    { icon: Heart, label: "Favorite", path: "/profile/wishlist" },
];

const ProfileLayout = () => {
    const { user } = useUserStore();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const getCurrentPageTitle = () => {
        const currentItem = menuItems.find(item => item.path === location.pathname);
        return currentItem ? currentItem.label : "Profil";
    };

    return (
        <div className="min-h-screen bg-gray-900 pt-20">
            <div className="container mx-auto px-4 py-8">
                {/* Mobile Menu Button */}
                <div className="lg:hidden flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">{getCurrentPageTitle()}</h1>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-gray-400 hover:text-white"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <motion.aside
                        className={`lg:w-64 ${
                            isMobileMenuOpen ? "block" : "hidden"
                        } lg:block bg-gray-800 rounded-lg p-4 h-fit`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-6 p-4 bg-[#2B4EE6] rounded-lg">
                            <p className="text-lg font-medium text-white">
                                {(() => {
                                    const hasName = user?.firstName || user?.lastName;
                                    if (hasName) {
                                        return `Salut, ${user.firstName || ''} ${user.lastName || ''}!`;
                                    } else if (user?.email) {
                                        return `Salut, ${user.email}!`;
                                    } else {
                                        return 'Salut!';
                                    }
                                })()}
                            </p>
                            <p className="text-sm text-blue-200">
                                {user?.email}
                            </p>
                        </div>
                        <nav className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                            isActive
                                                ? "bg-[#2B4EE6] text-white"
                                                : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                        }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                        {isActive && (
                                            <ChevronRight
                                                size={16}
                                                className="ml-auto"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </motion.aside>

                    {/* Main Content */}
                    <motion.main
                        className="flex-1 bg-gray-800 rounded-lg p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.main>
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout; 