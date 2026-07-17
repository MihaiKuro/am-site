import { useEffect, useState } from "react";
import axios from "../lib/axios";
import ServiceOrderSummary from "./ServiceOrderSummary";

const inputClass =
	"w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]";

const getClientLabel = (user) => {
	if (!user) return "—";
	if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
	return user.email || "—";
};

export default function MechanicsAdmin() {
	const [mechanics, setMechanics] = useState([]);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [expandedId, setExpandedId] = useState(null);
	const [sheetsByMechanic, setSheetsByMechanic] = useState({});
	const [sheetsLoadingId, setSheetsLoadingId] = useState(null);
	const [selectedSheet, setSelectedSheet] = useState(null);

	const fetchMechanics = async () => {
		setLoading(true);
		try {
			const res = await axios.get("/mechanics");
			setMechanics(res.data.mechanics);
		} catch (e) {
			setError("Eroare la încărcarea mecanicilor");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMechanics();
	}, []);

	const fetchSheetsForMechanic = async (mechanicId) => {
		setSheetsLoadingId(mechanicId);
		try {
			const res = await axios.get(`/service-orders?mechanicId=${mechanicId}`);
			setSheetsByMechanic((prev) => ({
				...prev,
				[mechanicId]: res.data.orders || [],
			}));
		} catch (e) {
			setError(e.response?.data?.message || "Eroare la încărcarea fișelor");
			setSheetsByMechanic((prev) => ({ ...prev, [mechanicId]: [] }));
		} finally {
			setSheetsLoadingId(null);
		}
	};

	const toggleMechanicSheets = async (mechanicId) => {
		if (expandedId === mechanicId) {
			setExpandedId(null);
			return;
		}
		setExpandedId(mechanicId);
		if (!sheetsByMechanic[mechanicId]) {
			await fetchSheetsForMechanic(mechanicId);
		}
	};

	const handleAdd = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		try {
			await axios.post("/mechanics", { name, email, phone });
			setName("");
			setEmail("");
			setPhone("");
			setSuccess("Mecanic adăugat cu succes!");
			fetchMechanics();
		} catch (e) {
			setError(e.response?.data?.message || "Eroare la adăugare");
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Sigur vrei să ștergi acest mecanic?")) return;
		setError("");
		setSuccess("");
		try {
			await axios.delete(`/mechanics/${id}`);
			setSuccess("Mecanic șters!");
			if (expandedId === id) setExpandedId(null);
			setSheetsByMechanic((prev) => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
			fetchMechanics();
		} catch (e) {
			setError(e.response?.data?.message || "Eroare la ștergere");
		}
	};

	const renderSheets = (mechanicId) => {
		if (sheetsLoadingId === mechanicId) {
			return <p className="text-gray-400 text-sm py-3">Se încarcă fișele...</p>;
		}

		const sheets = sheetsByMechanic[mechanicId] || [];
		if (sheets.length === 0) {
			return <p className="text-gray-400 text-sm py-3">Nicio fișă pentru acest mecanic.</p>;
		}

		return (
			<div className="space-y-2 py-2">
				{sheets.map((sheet) => (
					<button
						key={sheet._id}
						type="button"
						onClick={() => setSelectedSheet(sheet)}
						className="w-full text-left bg-gray-800/80 hover:bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 transition-colors"
					>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
							<div className="min-w-0">
								<p className="text-white text-sm font-medium truncate">
									{sheet.vehicle || "Vehicul"}
									{sheet.licensePlate ? ` · ${sheet.licensePlate}` : ""}
								</p>
								<p className="text-gray-400 text-xs mt-0.5">
									Client: {getClientLabel(sheet.user)}
									{" · "}
									{sheet.createdAt
										? new Date(sheet.createdAt).toLocaleDateString("ro-RO")
										: "—"}
								</p>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<span className="text-green-400 text-sm font-semibold">
									{(Number(sheet.totalCost) || 0).toFixed(0)} RON
								</span>
								<span className="text-[#93AAFF] text-xs">Vezi fișa</span>
							</div>
						</div>
					</button>
				))}
			</div>
		);
	};

	return (
		<div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6">
			<h2 className="text-lg sm:text-2xl font-bold text-white mb-4">Administrare Mecanici</h2>
			<form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6" onSubmit={handleAdd}>
				<input
					className={inputClass}
					placeholder="Nume mecanic*"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
				<input
					className={inputClass}
					placeholder="Email (opțional)"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					className={inputClass}
					placeholder="Telefon (opțional)"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
				/>
				<button
					type="submit"
					className="bg-[#2B4EE6] hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm sm:col-span-2 lg:col-span-1"
					disabled={loading}
				>
					Adaugă
				</button>
			</form>
			{error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
			{success && <div className="text-green-400 mb-2 text-sm">{success}</div>}

			{mechanics.length === 0 ? (
				<div className="text-center text-gray-400 py-6 text-sm">Niciun mecanic înregistrat.</div>
			) : (
				<div className="space-y-3">
					{mechanics.map((m) => {
						const isExpanded = expandedId === m._id;
						return (
							<div
								key={m._id}
								className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
							>
								<div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<div className="min-w-0">
										<p className="text-white font-medium text-sm sm:text-base">{m.name}</p>
										<p className="text-gray-400 text-xs mt-1 truncate">
											{m.email || "Fără email"}
											{" · "}
											{m.phone || "Fără telefon"}
										</p>
									</div>
									<div className="flex flex-wrap gap-2 shrink-0">
										<button
											type="button"
											className="bg-[#2B4EE6] hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm"
											onClick={() => toggleMechanicSheets(m._id)}
										>
											{isExpanded ? "Ascunde fișele" : "Vezi fișele"}
										</button>
										<button
											type="button"
											className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm"
											onClick={() => handleDelete(m._id)}
										>
											Șterge
										</button>
									</div>
								</div>
								{isExpanded && (
									<div className="px-4 pb-4 border-t border-gray-700">
										{renderSheets(m._id)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			{selectedSheet && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
					<div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-5">
						<div className="flex items-center justify-between gap-3 mb-4">
							<h3 className="text-white font-semibold text-lg">Fișă de service</h3>
							<button
								type="button"
								className="text-gray-400 hover:text-white text-sm"
								onClick={() => setSelectedSheet(null)}
							>
								Închide
							</button>
						</div>
						<p className="text-gray-400 text-sm mb-3">
							Client: {getClientLabel(selectedSheet.user)}
							{selectedSheet.vehicle ? ` · ${selectedSheet.vehicle}` : ""}
						</p>
						<ServiceOrderSummary entry={selectedSheet} className="bg-gray-800/50" />
					</div>
				</div>
			)}
		</div>
	);
}
