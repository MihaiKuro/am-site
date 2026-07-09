import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";

const SERVICE_TYPES = [
  { label: "Revizie generală", value: "Revizie", desc: "Schimb ulei, filtre și servicii de întreținere de rutină", duration: "1-2 ore" },
  { label: "Diagnoză și reparații", value: "Diagnoză", desc: "Diagnoză completă și servicii de reparații auto", duration: "Variază" },
  { label: "Instalare piese", value: "Altele", desc: "Instalare profesională a pieselor achiziționate", duration: "2-4 ore" },
];

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];

export default function ServiceAppointment() {
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0].value);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [note, setNote] = useState("");
  const [mechanics, setMechanics] = useState([]);
  const [mechanic, setMechanic] = useState("");
  const [reservedSlots, setReservedSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [vehicleMode, setVehicleMode] = useState("registered");
  const [newVehicle, setNewVehicle] = useState({ make: '', model: '', year: '', licensePlate: '', vin: '' });
  const [saveVehicle, setSaveVehicle] = useState(false);

  // Fetch mechanics la mount
  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const res = await axios.get("/mechanics");
        setMechanics(res.data.mechanics);
      } catch (e) {
        setError("Eroare la încărcarea mecanicilor");
      }
    };
    fetchMechanics();
  }, []);

  // Fetch reserved slots când se schimbă data sau mecanicul
  useEffect(() => {
    if (!date || !mechanic) {
      setReservedSlots([]);
      return;
    }
    const fetchSlots = async () => {
      try {
        const res = await axios.get(`/appointments/slots?date=${date}&mechanicId=${mechanic}`);
        setReservedSlots(res.data.reservedSlots || []);
      } catch (e) {
        setReservedSlots([]);
      }
    };
    fetchSlots();
  }, [date, mechanic]);

  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      setVehicles([]);
      return;
    }

    const fetchVehicles = async () => {
      try {
        const res = await axios.get("/vehicles/my");
        setVehicles(res.data.vehicles || []);
      } catch {
        setVehicles([]);
      }
    };
    fetchVehicles();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);
    try {
      // Creez un obiect Date cu data și ora selectată
      const [hour, minute] = time.split(":");
      const apptDate = new Date(date);
      apptDate.setHours(Number(hour), Number(minute), 0, 0);
      let vehicleToSend = vehicle;
      if (vehicleMode === "new") {
        if (saveVehicle) {
          // Salvează vehiculul și folosește id-ul
          try {
            const res = await axios.post("/vehicles", newVehicle);
            vehicleToSend = res.data.vehicle._id;
          } catch (e) {
            setError("Eroare la salvarea vehiculului");
            setSubmitting(false);
            return;
          }
        } else {
          vehicleToSend = newVehicle;
        }
      }
      await axios.post("/appointments", {
        vehicle: vehicleToSend,
        serviceType,
        date: apptDate,
        note,
        mechanic,
      });
      setSubmitting(false);
      setSuccess(true);
      setVehicle("");
      setNote("");
      setTime("");
    } catch (e) {
      setError(e.response?.data?.message || "Eroare la programare");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 sm:mt-16 mb-10 sm:mb-16 px-4 sm:px-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 px-2">Programează o programare la service</h2>
      <p className="text-sm sm:text-base text-gray-400 text-center mb-6 sm:mb-8 px-2">Servicii profesionale de instalare și întreținere oferite de mecanici autorizați</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
        {SERVICE_TYPES.map((type) => (
          <div key={type.value} className={`rounded-lg bg-gray-800 p-4 sm:p-6 border border-gray-700 ${serviceType === type.value ? 'ring-2 ring-[#2B4EE6]' : ''}`}
            onClick={() => setServiceType(type.value)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-start gap-3 mb-2">
              <span className="text-2xl shrink-0">{type.label === "General Maintenance" ? "🛠️" : type.label === "Diagnostics & Repairs" ? "🔧" : "📦"}</span>
              <span className="text-base sm:text-lg font-semibold text-white leading-snug">{type.label}</span>
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-2">{type.desc}</p>
            <p className="text-gray-500 text-xs sm:text-sm">Durata estimativă: {type.duration}</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-4 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8">
        {/* Left: Mechanics */}
        <div className="flex-1 mb-6 md:mb-0">
          <h3 className="text-lg font-semibold text-white mb-3">Mecanici disponibili:</h3>
          <ul className="mb-6">
            {mechanics.map((m) => (
              <li key={m._id} className="flex items-center gap-2 text-gray-200 mb-1">
                <span className="text-blue-400">👤</span>
                <span>{m.name} {m.role && <span className="text-gray-400 text-sm">- {m.role}</span>}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block shrink-0"></span>
              <span className="text-gray-300 text-sm">Interval orar disponibil</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block shrink-0"></span>
              <span className="text-gray-300 text-sm">Interval orar rezervat</span>
            </div>
          </div>
        </div>
        {/* Right: Form */}
        <form className="flex-1 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-300 mb-1">Selectează tipul serviciului</label>
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white"
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
            >
              {SERVICE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Selectează mecanicul</label>
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white"
              value={mechanic}
              onChange={e => setMechanic(e.target.value)}
              required
            >
              <option value="">Selectează mecanicul...</option>
              {mechanics.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Selectează data</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Intervale orare disponibile</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIME_SLOTS.map(slot => {
                const reserved = reservedSlots.includes(slot);
                return (
                  <button
                    type="button"
                    key={slot}
                    className={`px-3 py-2 rounded-md border text-sm font-medium flex items-center justify-between ${reserved ? 'bg-red-900/60 border-red-700 text-red-300 cursor-not-allowed' : (time === slot ? 'bg-blue-700 border-blue-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-200 hover:bg-blue-900/40')}`}
                    disabled={reserved}
                    onClick={() => setTime(slot)}
                  >
                    {slot}
                    {reserved ? <span className="ml-2">✗</span> : time === slot ? <span className="ml-2">✓</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Vehicul</label>
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white mb-2"
              value={vehicleMode === "new" ? "new" : vehicle}
              onChange={e => {
                if (e.target.value === "new") {
                  setVehicle("");
                  setVehicleMode("new");
                } else {
                  setVehicle(e.target.value);
                  setVehicleMode("registered");
                }
              }}
              required={vehicleMode !== "new"}
            >
              <option value="">Alege vehiculul...</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>
                  {v.make} {v.model} ({v.year}) - {v.licensePlate}
                </option>
              ))}
              <option value="new">Alt vehicul...</option>
            </select>
            {vehicleMode === "new" && (
              <div className="space-y-2 bg-gray-900 border border-gray-700 rounded-md p-4 mt-2">
                <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="Marcă" value={newVehicle.make} onChange={e => setNewVehicle(v => ({ ...v, make: e.target.value }))} required={vehicleMode === "new"} />
                <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="Model" value={newVehicle.model} onChange={e => setNewVehicle(v => ({ ...v, model: e.target.value }))} required={vehicleMode === "new"} />
                <input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="An" value={newVehicle.year} onChange={e => setNewVehicle(v => ({ ...v, year: e.target.value }))} required={vehicleMode === "new"} min={1900} max={new Date().toISOString().split("T")[0]} />
                <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="Număr Înmatriculare" value={newVehicle.licensePlate} onChange={e => setNewVehicle(v => ({ ...v, licensePlate: e.target.value }))} required={vehicleMode === "new"} />
                <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="VIN (opțional)" value={newVehicle.vin} onChange={e => setNewVehicle(v => ({ ...v, vin: e.target.value }))} />
                <label className="flex items-center gap-2 text-gray-300 mt-2">
                  <input type="checkbox" checked={saveVehicle} onChange={e => setSaveVehicle(e.target.checked)} />
                  Salvează vehiculul în contul meu
                </label>
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Notițe suplimentare</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white"
              placeholder="Orice problemă sau cerință specifică..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
          </div>
          {error && <div className="text-red-400 text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#2B4EE6] hover:bg-blue-700 text-white font-semibold text-lg transition-colors disabled:opacity-60"
            disabled={submitting || !date || !time || !mechanic}
          >
            {submitting ? 'Se programează...' : 'Programează programarea'}
          </button>
          {success && <div className="text-green-400 text-center mt-2">Programare realizată cu succes!</div>}
        </form>
      </div>
    </div>
  );
} 