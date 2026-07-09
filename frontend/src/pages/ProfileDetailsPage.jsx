import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";

const ProfileDetailsPage = () => {
    const { user, updateProfile } = useUserStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
    });

    // Use useEffect to update formData when user changes or when editing starts/stops
    useEffect(() => {
        setFormData({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phone: user?.phone || "",
        });
    }, [user]); // Re-initialize formData when the user object changes

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCancel = () => {
        // Revert formData to the current user's data when canceling
        setFormData({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phone: user?.phone || "",
        });
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send firstName, lastName, email, and phone directly to the backend
            const dataToUpdate = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
            };
            await updateProfile(dataToUpdate);
            setIsEditing(false);
            toast.success("Detaliile au fost actualizate cu succes!");
        } catch (error) {
            toast.error("A apărut o eroare la actualizarea detaliilor.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Detalii Personale</h2>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={isEditing ? handleCancel : () => setIsEditing(true)} // Call handleCancel when editing
                    className={`px-4 py-2 rounded-lg ${
                        isEditing
                            ? "bg-gray-600 text-white"
                            : "bg-[#2B4EE6] text-white"
                    }`}
                >
                    {isEditing ? "Anulează" : "Editează"}
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-700 rounded-lg p-6"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Nume
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Prenume
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Telefon
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                        />
                    </div>

                    {isEditing && (
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full px-4 py-2 bg-[#2B4EE6] text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Salvează Modificările
                        </motion.button>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default ProfileDetailsPage; 