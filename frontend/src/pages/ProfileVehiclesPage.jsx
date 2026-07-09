import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const VehicleForm = ({ vehicle, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        make: vehicle?.make || "",
        model: vehicle?.model || "",
        year: vehicle?.year || "",
        licensePlate: vehicle?.licensePlate || "",
        vin: vehicle?.vin || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Marcă</label>
                <input type="text" value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                <input type="text" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">An</label>
                <input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" required min={1900} max={2100} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Număr Înmatriculare</label>
                <input type="text" value={formData.licensePlate} onChange={e => setFormData({ ...formData, licensePlate: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">VIN (opțional)</label>
                <input type="text" value={formData.vin} onChange={e => setFormData({ ...formData, vin: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
            </div>
            <div className="flex gap-2 justify-end">
                <motion.button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-600 text-white" whileHover={{ scale: 1.05 }}>{<X size={16} />} Anulează</motion.button>
                <motion.button type="submit" className="px-4 py-2 rounded-lg bg-[#2B4EE6] text-white" whileHover={{ scale: 1.05 }}>{<Check size={16} />} Salvează</motion.button>
            </div>
        </form>
    );
};

const VehicleCard = ({ vehicle, onEdit, onDelete, onShowHistory }) => (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-gray-800 rounded-lg p-4 relative">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Car className="inline-block" /> {vehicle.make} {vehicle.model} ({vehicle.year})
                </h3>
                <p className="text-gray-400 text-sm mt-1">Număr: {vehicle.licensePlate}</p>
                {vehicle.vin && <p className="text-gray-400 text-sm">VIN: {vehicle.vin}</p>}
                <button
                    className="px-3 py-1 rounded bg-blue-700 text-white text-xs mt-2"
                    onClick={() => onShowHistory(vehicle)}
                >
                    Vezi Istoric Service
                </button>
            </div>
            <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(vehicle)} className="p-2 text-gray-400 hover:text-white transition-colors"><Pencil size={16} /></motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(vehicle)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></motion.button>
            </div>
        </div>
    </motion.div>
);

const ProfileVehiclesPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyVehicle, setHistoryVehicle] = useState(null);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/vehicles/my");
            setVehicles(res.data.vehicles || []);
        } catch {
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleAdd = async (data) => {
        setLoading(true);
        try {
            await axios.post("/vehicles", data);
            toast.success("Vehicul adăugat!");
            setShowForm(false);
            fetchVehicles();
        } catch (e) {
            toast.error(e.response?.data?.message || "Eroare la adăugare");
        } finally {
            setLoading(false);
        }
    };
    const handleEdit = async (data) => {
        setLoading(true);
        try {
            await axios.put(`/vehicles/${editingVehicle._id}`, data);
            toast.success("Vehicul actualizat!");
            setEditingVehicle(null);
            setShowForm(false);
            fetchVehicles();
        } catch (e) {
            toast.error(e.response?.data?.message || "Eroare la actualizare");
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (vehicle) => {
        if (!window.confirm("Sigur vrei să ștergi acest vehicul?")) return;
        setLoading(true);
        try {
            await axios.delete(`/vehicles/${vehicle._id}`);
            toast.success("Vehicul șters!");
            fetchVehicles();
        } catch (e) {
            toast.error(e.response?.data?.message || "Eroare la ștergere");
        } finally {
            setLoading(false);
        }
    };

    const handleShowHistory = async (vehicle) => {
        setShowHistory(true);
        setHistoryVehicle(vehicle);
        setHistoryLoading(true);
        try {
            const res = await axios.get(`/service-orders/history?licensePlate=${encodeURIComponent(vehicle.licensePlate)}`);
            setHistory(res.data.history || []);
        } catch {
            setHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Vehiculele Mele</h2>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setShowForm(true); setEditingVehicle(null); }}
                    className="px-4 py-2 rounded-lg bg-[#2B4EE6] text-white"
                >
                    <Plus size={16} className="inline-block mr-1" /> Adaugă Vehicul
                </motion.button>
            </div>
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-gray-700 rounded-lg p-6 mb-6">
                        <VehicleForm
                            vehicle={editingVehicle}
                            onSubmit={editingVehicle ? handleEdit : handleAdd}
                            onCancel={() => { setShowForm(false); setEditingVehicle(null); }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            {loading ? (
                <div className="text-center py-8 text-gray-400">Se încarcă vehiculele...</div>
            ) : vehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Nu ai niciun vehicul adăugat.</div>
            ) : (
                <div className="space-y-4">
                    {vehicles.map((v) => (
                        <VehicleCard
                            key={v._id}
                            vehicle={v}
                            onEdit={(veh) => { setEditingVehicle(veh); setShowForm(true); }}
                            onDelete={handleDelete}
                            onShowHistory={handleShowHistory}
                        />
                    ))}
                </div>
            )}
            {showHistory && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mt-6">
                    <h3 className="text-xl font-bold text-white mb-4">Istoric Service pentru {historyVehicle?.make} {historyVehicle?.model} ({historyVehicle?.licensePlate})</h3>
                    {historyLoading ? (
                        <div className="text-gray-400">Se încarcă...</div>
                    ) : history.length === 0 ? (
                        <div className="text-gray-400">Nu există intervenții pentru acest vehicul.</div>
                    ) : (
                        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-gray-300">Data</th>
                                    <th className="px-4 py-2 text-left text-gray-300">Lucrări</th>
                                    <th className="px-4 py-2 text-left text-gray-300">Piese</th>
                                    <th className="px-4 py-2 text-left text-gray-300">Cost</th>
                                    <th className="px-4 py-2 text-left text-gray-300">Mecanic</th>
                                    <th className="px-4 py-2 text-left text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h) => (
                                    <tr key={h._id}>
                                        <td className="px-4 py-2 text-white">{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : '-'}</td>
                                        <td className="px-4 py-2 text-gray-300">{h.worksPerformed || '-'}</td>
                                        <td className="px-4 py-2 text-gray-300">{h.partsUsed?.map(p => p.name).join(', ') || '-'}</td>
                                        <td className="px-4 py-2 text-gray-300">{h.totalCost} RON</td>
                                        <td className="px-4 py-2 text-gray-300">{h.mechanic?.name || '-'}</td>
                                        <td className="px-4 py-2 text-gray-300">{h.status || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <button className="mt-4 px-4 py-2 rounded bg-gray-700 text-white" onClick={() => setShowHistory(false)}>Închide</button>
                </div>
            )}
        </div>
    );
};

export default ProfileVehiclesPage; 