import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { Wrench, ScanSearch, Package, UserRound } from "lucide-react";

const SERVICE_TYPES = [
  { label: "Revizie generală", value: "Revizie", desc: "Schimb ulei, filtre și servicii de întreținere de rutină", duration: "1-2 ore", icon: Wrench },
  { label: "Diagnoză și reparații", value: "Diagnoză", desc: "Diagnoză completă și servicii de reparații auto", duration: "Variază", icon: ScanSearch },
  { label: "Instalare piese", value: "Altele", desc: "Instalare profesională a pieselor achiziționate", duration: "2-4 ore", icon: Package },
];

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];

export default function ServiceAppointment({ onSuccess, compact = false }) {
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
      onSuccess?.();
    } catch (e) {
      setError(e.response?.data?.message || "Eroare la programare");
      setSubmitting(false);
    }
  };

  return (
    <div className={`max-w-5xl mx-auto ${compact ? "mt-0 mb-0" : "pt-14 sm:pt-20 pb-0"} px-4 sm:px-6 lg:px-8`}>
      {!compact && (
        <div className="mb-8 sm:mb-10 max-w-2xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B7A94] mb-3">
            Service autorizat
          </p>
          <h2 className="font-hero text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 px-2">
            Programează o programare la service
          </h2>
          <p className="text-sm sm:text-base text-[#9CA8BC] px-2 leading-relaxed">
            Servicii profesionale de instalare și întreținere oferite de mecanici autorizați
          </p>
        </div>
      )}
      {compact && (
        <>
          <h2 className="font-hero text-xl sm:text-2xl font-bold text-white text-center mb-2 pr-8">Programează service</h2>
          <p className="text-sm text-[#9CA8BC] text-center mb-6">Alege serviciul, mecanicul și intervalul orar</p>
        </>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-10">
        {SERVICE_TYPES.map((type) => {
          const Icon = type.icon;
          const selected = serviceType === type.value;
          return (
          <div
            key={type.value}
            className={`rounded-2xl border p-4 sm:p-5 cursor-pointer transition-colors ${
              selected
                ? "border-[#2B4EE6] bg-[#2B4EE6]/10 ring-1 ring-[#2B4EE6]/40"
                : "border-[#2A3548] bg-[#111827]/80 hover:border-[#3D4F6F]"
            }`}
            onClick={() => setServiceType(type.value)}
          >
            <div className="flex items-start gap-3 mb-2">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-[#2B4EE6]/20 text-[#93AAFF]" : "bg-[#141B28] text-[#6B7A94]"}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-base sm:text-lg font-semibold text-white leading-snug">{type.label}</span>
            </div>
            <p className="text-sm text-[#9CA8BC] mb-2">{type.desc}</p>
            <p className="text-[#6B7A94] text-xs sm:text-sm">Durata estimativă: {type.duration}</p>
          </div>
        );})}
      </div>
      <div className="relative rounded-2xl border border-[#2A3548] bg-[#111827]/90 p-4 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8">
        {/* Left: Mechanics */}
        <div className="flex-1 mb-6 md:mb-0 md:border-r md:border-[#2A3548] md:pr-8">
          <h3 className="font-hero text-lg font-semibold text-white mb-3">Mecanici disponibili</h3>
          <ul className="mb-6 space-y-2">
            {mechanics.map((m) => (
              <li key={m._id} className="flex items-center gap-2.5 text-[#E8EDF5]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2B4EE6]/15 text-[#93AAFF]">
                  <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="text-sm">
                  {m.name}
                  {m.role && <span className="text-[#6B7A94]"> — {m.role}</span>}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 mt-6 pt-4 border-t border-[#2A3548]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3DD68C] inline-block shrink-0" />
              <span className="text-[#9CA8BC] text-sm">Interval disponibil</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shrink-0" />
              <span className="text-[#9CA8BC] text-sm">Interval rezervat</span>
            </div>
          </div>
        </div>
        {/* Right: Form */}
        <form className="flex-1 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[#9CA8BC] text-sm mb-1.5">Selectează tipul serviciului</label>
            <select
              className="w-full bg-[#0B0F17] border border-[#2A3548] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]/50"
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
            >
              {SERVICE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#9CA8BC] text-sm mb-1.5">Selectează mecanicul</label>
            <select
              className="w-full bg-[#0B0F17] border border-[#2A3548] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]/50"
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
            <label className="block text-[#9CA8BC] text-sm mb-1.5">Selectează data</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-[#0B0F17] border border-[#2A3548] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]/50"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[#9CA8BC] text-sm mb-1.5">Intervale orare disponibile</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIME_SLOTS.map(slot => {
                const reserved = reservedSlots.includes(slot);
                return (
                  <button
                    type="button"
                    key={slot}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center justify-between transition-colors ${
                      reserved
                        ? "bg-red-950/40 border-red-800/60 text-red-300 cursor-not-allowed"
                        : time === slot
                          ? "bg-[#2B4EE6] border-[#2B4EE6] text-white"
                          : "bg-[#0B0F17] border-[#2A3548] text-[#E8EDF5] hover:border-[#2B4EE6]/50"
                    }`}
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
            <label className="block text-[#9CA8BC] text-sm mb-1.5">Vehicul</label>
            <select
              className="w-full bg-[#0B0F17] border border-[#2A3548] rounded-lg px-3 py-2.5 text-white mb-2 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]/50"
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
              <div className="space-y-2 bg-[#0B0F17] border border-[#2A3548] rounded-lg p-4 mt-2">
                <input type="text" className="w-full bg-[#111827] border border-[#2A3548] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]/50" placeholder="Marcă" value={newVehicle.make} onChange={e => setNewVehicle(v => ({ ...v, make: e.target.value }))} required={vehicleMode === "new"} />
                <input type="text" className="w-full bg-[#111827] border border-[#2A3548] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]/50" placeholder="Model" value={newVehicle.model} onChange={e => setNewVehicle(v => ({ ...v, model: e.target.value }))} required={vehicleMode === "new"} />
                <input type="number" className="w-full bg-[#111827] border border-[#2A3548] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]/50" placeholder="An" value={newVehicle.year} onChange={e => setNewVehicle(v => ({ ...v, year: e.target.value }))} required={vehicleMode === "new"} min={1900} max={new Date().toISOString().split("T")[0]} />
                <input type="text" className="w-full bg-[#111827] border border-[#2A3548] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]/50" placeholder="Număr Înmatriculare" value={newVehicle.licensePlate} onChange={e => setNewVehicle(v => ({ ...v, licensePlate: e.target.value }))} required={vehicleMode === "new"} />
                <input type="text" className="w-full bg-[#111827] border border-[#2A3548] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]/50" placeholder="VIN (opțional)" value={newVehicle.vin} onChange={e => setNewVehicle(v => ({ ...v, vin: e.target.value }))} />
                <label className="flex items-center gap-2 text-[#9CA8BC] mt-2 text-sm">
                  <input type="checkbox" checked={saveVehicle} onChange={e => setSaveVehicle(e.target.checked)} className="rounded border-[#2A3548]" />
                  Salvează vehiculul în contul meu
                </label>
              </div>
            )}
          </div>
          <div>
            <label className="block text-[#9CA8BC] text-sm mb-1.5">Notițe suplimentare</label>
            <textarea
              className="w-full bg-[#0B0F17] border border-[#2A3548] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]/50"
              placeholder="Orice problemă sau cerință specifică..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
          </div>
          {error && <div className="text-red-400 text-center text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#F5A623] hover:bg-[#FFBE4D] text-[#0B0F17] font-semibold text-base sm:text-lg transition-colors disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5A623]"
            disabled={submitting || !date || !time || !mechanic}
          >
            {submitting ? "Se programează..." : "Programează programarea"}
          </button>
          {success && <div className="text-[#3DD68C] text-center mt-2 text-sm">Programare realizată cu succes!</div>}
        </form>
      </div>
    </div>
  );
} 