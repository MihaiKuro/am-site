import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Calendar, Car, User } from "lucide-react";
import ServiceAppointment from "../components/ServiceAppointment";

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-800 rounded-lg p-6 relative w-full sm:max-w-2xl">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
        >×</button>
        {children}
      </div>
    </div>
  );
}

export default function ProfileAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/appointments/my");
        setAppointments(res.data.appointments || []);
      } catch (e) {
        setError(e.response?.data?.message || "Eroare la încărcarea programărilor");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Calendar /> Programările mele la service</h2>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 rounded-lg bg-[#2B4EE6] text-white"
          onClick={() => setShowModal(true)}
        >
          Programează Service
        </button>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ServiceAppointment onSuccess={() => { setShowModal(false); fetchAppointments(); }} />
      </Modal>
      {loading ? (
        <div className="text-center py-8 text-gray-400">Se încarcă programările...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Nu ai nicio programare la service.</div>
      ) : (
        <div className="space-y-4">
          {appointments.map(appt => (
            <div key={appt._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Car /> {appt.vehicle || "Vehicul"}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  appt.status === "Confirmată" ? "bg-green-100 text-green-800" :
                  appt.status === "Anulată" ? "bg-red-100 text-red-800" :
                  appt.status === "Finalizată" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {appt.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-gray-300 text-sm mb-2">
                <div className="flex items-center gap-1"><Calendar size={16} /> {appt.date ? new Date(appt.date).toLocaleString() : "-"}</div>
                <div className="flex items-center gap-1"><User size={16} /> {appt.mechanic?.name || "Mecanic"}</div>
                <div>Tip: <span className="text-white font-medium">{appt.serviceType}</span></div>
              </div>
              {appt.note && <div className="text-gray-400 text-sm mt-2">Notă: {appt.note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 

