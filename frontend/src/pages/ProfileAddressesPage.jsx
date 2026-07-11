import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";

const AddressForm = ({ address, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: address?.title || "",
        street: address?.street || "",
        city: address?.city || "",
        county: address?.county || "",
        postalCode: address?.postalCode || "",
        isDefault: address?.isDefault || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    Titlu Adresă
                </label>
                <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                    placeholder="Ex: Acasă, Birou"
                    required
                />
            </div>
            <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-300 mb-1">
                    Stradă și Număr
                </label>
                <input
                    type="text"
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                    placeholder="Ex: Strada Principală 123"
                    required
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                        Oraș
                    </label>
                    <input
                        type="text"
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="county" className="block text-sm font-medium text-gray-300 mb-1">
                        Județ
                    </label>
                    <input
                        type="text"
                        id="county"
                        value={formData.county}
                        onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                        required
                    />
                </div>
            </div>
            <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300 mb-1">
                    Cod Poștal
                </label>
                <input
                    type="text"
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent"
                    required
                />
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4 text-[#2B4EE6] bg-gray-800 border-gray-600 rounded focus:ring-[#2B4EE6]"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-300">
                    Setează ca adresă principală
                </label>
            </div>
            <div className="flex gap-4 pt-4">
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 bg-[#2B4EE6] text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Salvează
                </motion.button>
                <motion.button
                    type="button"
                    onClick={onCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                    Anulează
                </motion.button>
            </div>
        </form>
    );
};

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800 rounded-lg p-4 relative"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        {address.title}
                        {address.isDefault && (
                            <span className="text-xs bg-[#2B4EE6] text-white px-2 py-1 rounded-full">
                                Principal
                            </span>
                        )}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{address.street}</p>
                    <p className="text-gray-400 text-sm">
                        {address.city}, {address.county} {address.postalCode}
                    </p>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(address)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Pencil size={16} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(address)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </motion.button>
                    {!address.isDefault && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onSetDefault(address)}
                            className="p-2 text-gray-400 hover:text-[#2B4EE6] transition-colors"
                        >
                            <Check size={16} />
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const ProfileAddressesPage = () => {
    const { user, updateProfile } = useUserStore();
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const handleAddAddress = async (addressData) => {
        try {
            const newAddresses = [...(user.addresses || [])];
            
            // If this is the first address or marked as default, update other addresses
            if (addressData.isDefault || newAddresses.length === 0) {
                newAddresses.forEach(addr => addr.isDefault = false);
                addressData.isDefault = true;
            }
            
            newAddresses.push(addressData);
            
            await updateProfile({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                addresses: newAddresses,
            });
            setShowForm(false);
            toast.success("Adresa a fost adăugată cu succes!");
        } catch (error) {
            toast.error("A apărut o eroare la adăugarea adresei.");
        }
    };

    const handleEditAddress = async (addressData) => {
        try {
            const newAddresses = [...(user.addresses || [])];
            const index = newAddresses.findIndex((addr) =>
                editingAddress._id ? addr._id === editingAddress._id : addr === editingAddress
            );

            // If setting this address as default, update other addresses
            if (addressData.isDefault) {
                newAddresses.forEach(addr => addr.isDefault = false);
            }
            // If this was the default address and we're removing default status,
            // don't allow it if it's the only address
            else if (editingAddress.isDefault && newAddresses.length === 1) {
                addressData.isDefault = true;
            }

            newAddresses[index] = {
                ...addressData,
                ...(editingAddress._id && { _id: editingAddress._id }),
            };

            await updateProfile({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                addresses: newAddresses,
            });
            setEditingAddress(null);
            toast.success("Adresa a fost actualizată cu succes!");
        } catch (error) {
            toast.error("A apărut o eroare la actualizarea adresei.");
        }
    };

    const handleDeleteAddress = async (address) => {
        try {
            const newAddresses = user.addresses.filter((addr) =>
                address._id ? addr._id !== address._id : addr !== address
            );

            // If we're deleting the default address and there are other addresses,
            // make the first remaining address the default
            if (address.isDefault && newAddresses.length > 0) {
                newAddresses[0].isDefault = true;
            }

            await updateProfile({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                addresses: newAddresses,
            });
            toast.success("Adresa a fost ștearsă cu succes!");
        } catch (error) {
            toast.error("A apărut o eroare la ștergerea adresei.");
        }
    };

    const handleSetDefaultAddress = async (address) => {
        try {
            const newAddresses = user.addresses.map((addr) => ({
                ...addr,
                isDefault: address._id ? addr._id === address._id : addr === address,
            }));

            await updateProfile({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                addresses: newAddresses,
            });
            toast.success("Adresa principală a fost actualizată!");
        } catch (error) {
            toast.error("A apărut o eroare la actualizarea adresei principale.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Adresele Mele</h2>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2B4EE6] text-white rounded-lg hover:bg-blue-600 transition-colors shrink-0"
                >
                    <Plus size={20} />
                    Adaugă Adresă
                </motion.button>
            </div>

            {/* Address Form */}
            <AnimatePresence>
                {(showForm || editingAddress) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-700 rounded-lg p-6"
                    >
                        <AddressForm
                            address={editingAddress}
                            onSubmit={editingAddress ? handleEditAddress : handleAddAddress}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingAddress(null);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Addresses List */}
            <div className="grid gap-4">
                <AnimatePresence>
                    {user?.addresses?.map((address) => (
                        <AddressCard
                            key={address._id || `${address.title}-${address.street}`}
                            address={address}
                            onEdit={setEditingAddress}
                            onDelete={handleDeleteAddress}
                            onSetDefault={handleSetDefaultAddress}
                        />
                    ))}
                </AnimatePresence>
                
                {(!user?.addresses || user.addresses.length === 0) && !showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <MapPin size={40} className="mx-auto text-gray-500 mb-4" />
                        <p className="text-gray-400">Nu ai nicio adresă salvată</p>
                        <p className="text-gray-500 text-sm mt-1">
                            Adaugă o adresă pentru a putea plasa comenzi mai rapid
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProfileAddressesPage; 