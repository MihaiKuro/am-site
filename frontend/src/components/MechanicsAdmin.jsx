import { useEffect, useState } from "react";
import axios from "../lib/axios";

const inputClass =
	"w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]";

export default function MechanicsAdmin() {
	const [mechanics, setMechanics] = useState([]);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

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
			fetchMechanics();
		} catch (e) {
			setError(e.response?.data?.message || "Eroare la ștergere");
		}
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
				<>
					<div className="md:hidden space-y-3">
						{mechanics.map((m) => (
							<div
								key={m._id}
								className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex items-start justify-between gap-3"
							>
								<div className="min-w-0">
									<p className="text-white font-medium text-sm">{m.name}</p>
									<p className="text-gray-400 text-xs mt-1 truncate">{m.email || "Fără email"}</p>
									<p className="text-gray-400 text-xs">{m.phone || "Fără telefon"}</p>
								</div>
								<button
									className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm shrink-0"
									onClick={() => handleDelete(m._id)}
								>
									Șterge
								</button>
							</div>
						))}
					</div>

					<div className="hidden md:block overflow-x-auto">
						<table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg text-sm">
							<thead>
								<tr>
									<th className="px-4 py-2 text-left text-gray-300">Nume</th>
									<th className="px-4 py-2 text-left text-gray-300">Email</th>
									<th className="px-4 py-2 text-left text-gray-300">Telefon</th>
									<th className="px-4 py-2"></th>
								</tr>
							</thead>
							<tbody>
								{mechanics.map((m) => (
									<tr key={m._id} className="border-t border-gray-700">
										<td className="px-4 py-2 text-white">{m.name}</td>
										<td className="px-4 py-2 text-gray-300">{m.email || "-"}</td>
										<td className="px-4 py-2 text-gray-300">{m.phone || "-"}</td>
										<td className="px-4 py-2">
											<button
												className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm"
												onClick={() => handleDelete(m._id)}
											>
												Șterge
											</button>
										</td>
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
