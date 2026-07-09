import { useEffect, useState } from "react";
import axios from "../lib/axios";

const STATUS_OPTIONS = ["În așteptare", "Confirmată", "Finalizată", "Anulată"];

const filterClass =
	"w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]";

const getUserLabel = (user) => {
	if (!user) return "-";
	const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
	return name || user.email || "-";
};

const getVehicleLabel = (vehicle) => {
	if (!vehicle) return "-";
	if (typeof vehicle === "string") return vehicle;
	if (vehicle.make || vehicle.model) {
		return `${vehicle.make || ""} ${vehicle.model || ""}`.trim() || "-";
	}
	return "-";
};

const getStatusClass = (status) => {
	switch (status) {
		case "Confirmată":
			return "bg-green-900/50 text-green-300 border-green-700";
		case "Anulată":
			return "bg-red-900/50 text-red-300 border-red-700";
		case "Finalizată":
			return "bg-blue-900/50 text-blue-300 border-blue-700";
		default:
			return "bg-yellow-900/50 text-yellow-300 border-yellow-700";
	}
};

export default function AppointmentsList() {
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [filterMechanic, setFilterMechanic] = useState("");
	const [filterUser, setFilterUser] = useState("");
	const [sortField, setSortField] = useState("date");
	const [sortDir, setSortDir] = useState("desc");
	const [mechanics, setMechanics] = useState([]);
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		const fetchMechanics = async () => {
			try {
				const res = await axios.get("/mechanics");
				setMechanics(res.data.mechanics || []);
			} catch {}
		};
		fetchMechanics();
	}, []);

	useEffect(() => {
		const fetchAppointments = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await axios.get("/appointments");
				setAppointments(res.data.appointments || []);
			} catch (e) {
				setError(e.response?.data?.message || "Eroare la încărcarea programărilor");
			} finally {
				setLoading(false);
			}
		};
		fetchAppointments();
	}, []);

	let filtered = appointments.filter((appt) => {
		return (
			(!filterStatus || appt.status === filterStatus) &&
			(!filterMechanic || (appt.mechanic && appt.mechanic._id === filterMechanic)) &&
			(!filterUser ||
				(appt.user &&
					(appt.user.firstName?.toLowerCase().includes(filterUser.toLowerCase()) ||
						appt.user.lastName?.toLowerCase().includes(filterUser.toLowerCase()) ||
						appt.user.email?.toLowerCase().includes(filterUser.toLowerCase()))))
		);
	});
	filtered.sort((a, b) => {
		let vA = a[sortField];
		let vB = b[sortField];
		if (sortField === "date") {
			vA = new Date(vA);
			vB = new Date(vB);
		}
		if (vA < vB) return sortDir === "asc" ? -1 : 1;
		if (vA > vB) return sortDir === "asc" ? 1 : -1;
		return 0;
	});

	const handleConfirm = async (id) => {
		try {
			const res = await axios.put(`/appointments/${id}/confirm`);
			setAppointments((appts) => appts.map((a) => (a._id === id ? res.data.appointment : a)));
		} catch (e) {
			alert(e.response?.data?.message || "Eroare la confirmare");
		}
	};
	const handleCancel = async (id) => {
		if (!window.confirm("Sigur vrei să anulezi această programare?")) return;
		try {
			const res = await axios.put(`/appointments/${id}/cancel-admin`);
			setAppointments((appts) => appts.map((a) => (a._id === id ? res.data.appointment : a)));
		} catch (e) {
			alert(e.response?.data?.message || "Eroare la anulare");
		}
	};
	const handleDelete = async (id) => {
		if (!window.confirm("Sigur vrei să ștergi această programare?")) return;
		try {
			await axios.delete(`/appointments/${id}/admin`);
			setAppointments((appts) => appts.filter((a) => a._id !== id));
		} catch (e) {
			alert(e.response?.data?.message || "Eroare la ștergere");
		}
	};

	const renderActions = (appt) => (
		<div className="flex flex-wrap gap-2">
			{appt.status !== "Confirmată" && appt.status !== "Anulată" && (
				<button
					className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm"
					onClick={() => handleConfirm(appt._id)}
				>
					Confirmă
				</button>
			)}
			{appt.status !== "Anulată" && (
				<button
					className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm"
					onClick={() => handleCancel(appt._id)}
				>
					Anulează
				</button>
			)}
			{appt.status === "Anulată" && (
				<button
					className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm"
					onClick={() => handleDelete(appt._id)}
				>
					Șterge
				</button>
			)}
		</div>
	);

	if (loading) return <div className="text-center py-8 text-gray-300 text-sm">Se încarcă programările...</div>;
	if (error) return <div className="text-center py-8 text-red-400 text-sm">{error}</div>;

	return (
		<div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
				<h2 className="text-lg sm:text-2xl font-bold text-white">Programări Service</h2>
				<button
					type="button"
					onClick={() => setShowFilters(!showFilters)}
					className="md:hidden w-full sm:w-auto px-4 py-2 text-sm bg-gray-900 border border-gray-700 text-white rounded-lg"
				>
					{showFilters ? "Ascunde filtrele" : "Arată filtrele"}
				</button>
			</div>

			<div className={`${showFilters ? "block" : "hidden"} md:block mb-4`}>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					<select className={filterClass} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
						<option value="">Toate statusurile</option>
						{STATUS_OPTIONS.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
					<select className={filterClass} value={filterMechanic} onChange={(e) => setFilterMechanic(e.target.value)}>
						<option value="">Toți mecanicii</option>
						{mechanics.map((m) => (
							<option key={m._id} value={m._id}>
								{m.name}
							</option>
						))}
					</select>
					<input
						className={filterClass}
						placeholder="Caută user..."
						value={filterUser}
						onChange={(e) => setFilterUser(e.target.value)}
					/>
					<select className={filterClass} value={sortField} onChange={(e) => setSortField(e.target.value)}>
						<option value="date">Sortare: Dată/Ora</option>
						<option value="status">Sortare: Status</option>
						<option value="serviceType">Sortare: Tip Serviciu</option>
					</select>
					<select className={filterClass} value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
						<option value="desc">Descrescător</option>
						<option value="asc">Crescător</option>
					</select>
				</div>
			</div>

			{filtered.length === 0 ? (
				<div className="text-center text-gray-400 py-8 text-sm">Nicio programare găsită.</div>
			) : (
				<>
					{/* Mobile: cards */}
					<div className="md:hidden space-y-3">
						{filtered.map((appt) => (
							<div key={appt._id} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-white text-sm font-medium">
											{appt.date ? new Date(appt.date).toLocaleString("ro-RO") : "-"}
										</p>
										<p className="text-gray-400 text-xs mt-1">{appt.serviceType}</p>
									</div>
									<span
										className={`text-xs px-2 py-1 rounded-full border shrink-0 ${getStatusClass(appt.status)}`}
									>
										{appt.status}
									</span>
								</div>

								<div className="space-y-1.5 text-sm">
									<p className="text-gray-300">
										<span className="text-gray-500">User: </span>
										{getUserLabel(appt.user)}
									</p>
									<p className="text-gray-300">
										<span className="text-gray-500">Mecanic: </span>
										{appt.mechanic?.name || "-"}
									</p>
									<p className="text-gray-300">
										<span className="text-gray-500">Vehicul: </span>
										{getVehicleLabel(appt.vehicle)}
									</p>
									{appt.note && (
										<p className="text-gray-400 text-xs">
											<span className="text-gray-500">Notă: </span>
											{appt.note}
										</p>
									)}
								</div>

								{renderActions(appt)}
							</div>
						))}
					</div>

					{/* Desktop: table */}
					<div className="hidden md:block overflow-x-auto">
						<table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg text-sm">
							<thead>
								<tr>
									<th className="px-4 py-2 text-left text-gray-300">Data/Ora</th>
									<th className="px-4 py-2 text-left text-gray-300">User</th>
									<th className="px-4 py-2 text-left text-gray-300">Mecanic</th>
									<th className="px-4 py-2 text-left text-gray-300">Tip Serviciu</th>
									<th className="px-4 py-2 text-left text-gray-300">Vehicul</th>
									<th className="px-4 py-2 text-left text-gray-300">Status</th>
									<th className="px-4 py-2 text-left text-gray-300">Note</th>
									<th className="px-4 py-2 text-left text-gray-300">Acțiuni</th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((appt) => (
									<tr key={appt._id} className="border-t border-gray-700">
										<td className="px-4 py-2 text-white whitespace-nowrap">
											{appt.date ? new Date(appt.date).toLocaleString("ro-RO") : "-"}
										</td>
										<td className="px-4 py-2 text-gray-300">{getUserLabel(appt.user)}</td>
										<td className="px-4 py-2 text-gray-300">{appt.mechanic?.name || "-"}</td>
										<td className="px-4 py-2 text-gray-300">{appt.serviceType}</td>
										<td className="px-4 py-2 text-gray-300">{getVehicleLabel(appt.vehicle)}</td>
										<td className="px-4 py-2 text-gray-300">{appt.status}</td>
										<td className="px-4 py-2 text-gray-300 max-w-[200px] truncate">{appt.note || "-"}</td>
										<td className="px-4 py-2 text-gray-300">{renderActions(appt)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
}
