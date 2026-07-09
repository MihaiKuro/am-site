import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Key, Save, Loader } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
    const { user, updateProfile } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Validate passwords if trying to change them
            if (formData.newPassword || formData.currentPassword || formData.confirmNewPassword) {
                if (!formData.currentPassword) {
                    throw new Error("Current password is required to change password");
                }
                if (formData.newPassword !== formData.confirmNewPassword) {
                    throw new Error("New passwords do not match");
                }
            }

            // Only send password data if changing password
            const updateData = {
                name: formData.name,
                email: formData.email,
                ...(formData.newPassword && {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            };

            await updateProfile(updateData);
            toast.success("Profile updated successfully!");
            
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                >
                    {/* Profile Header */}
                    <div className="bg-[#2B4EE6] px-6 py-8">
                        <div className="flex items-center">
                            <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
                                <User className="h-10 w-10 text-white" />
                            </div>
                            <div className="ml-6">
                                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                                <p className="text-blue-200">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information Section */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                                        Full Name
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                                        />
                                        <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                                        Email Address
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                                        />
                                        <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Change Password Section */}
                            <div className="space-y-4 pt-6 border-t border-gray-700">
                                <h2 className="text-xl font-semibold text-white">Change Password</h2>
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400">
                                        Current Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                                        />
                                        <Key className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400">
                                        New Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            type="password"
                                            id="newPassword"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                                        />
                                        <Key className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-400">
                                        Confirm New Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            type="password"
                                            id="confirmNewPassword"
                                            value={formData.confirmNewPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                                        />
                                        <Key className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#2B4EE6] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B4EE6] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="-ml-1 mr-2 h-5 w-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage; 