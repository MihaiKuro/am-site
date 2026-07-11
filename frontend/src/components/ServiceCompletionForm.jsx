import { useEffect, useMemo, useState } from "react";
import axios from "../lib/axios";
import { Plus, Trash2 } from "lucide-react";

const emptyDraft = {
	worksPerformed: "",
	laborHours: "",
	laborCost: "",
	notes: "",
	catalogParts: [],
};

const ServiceCompletionForm = ({ appointmentId, draft = emptyDraft, onDraftChange, onSubmit, saving }) => {
	const [products, setProducts] = useState([]);
	const [productSearch, setProductSearch] = useState("");
	const [selectedProductId, setSelectedProductId] = useState("");
	const [selectedQuantity, setSelectedQuantity] = useState(1);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const res = await axios.get("/products");
				setProducts(res.data.products || []);
			} catch {
				setProducts([]);
			}
		};
		fetchProducts();
	}, []);

	const filteredProducts = useMemo(() => {
		const query = productSearch.trim().toLowerCase();
		return products
			.filter((product) => product.stock > 0)
			.filter((product) => !query || product.name.toLowerCase().includes(query))
			.slice(0, 50);
	}, [products, productSearch]);

	const updateField = (field, value) => {
		onDraftChange({ ...draft, [field]: value });
	};

	const partsTotal = (draft.catalogParts || []).reduce(
		(sum, part) => sum + Number(part.price) * Number(part.quantity),
		0
	);
	const laborTotal = Number(draft.laborCost) || 0;
	const grandTotal = partsTotal + laborTotal;

	const addCatalogPart = () => {
		if (!selectedProductId) return;

		const product = products.find((item) => item._id === selectedProductId);
		if (!product) return;

		const quantity = Math.max(1, Number(selectedQuantity) || 1);
		const existing = (draft.catalogParts || []).find((part) => part.productId === product._id);
		const nextQuantity = (existing?.quantity || 0) + quantity;

		if (nextQuantity > product.stock) {
			alert(`Stoc insuficient pentru ${product.name}. Disponibil: ${product.stock}`);
			return;
		}

		const nextParts = existing
			? (draft.catalogParts || []).map((part) =>
					part.productId === product._id ? { ...part, quantity: nextQuantity } : part
				)
			: [
					...(draft.catalogParts || []),
					{
						productId: product._id,
						name: product.name,
						price: product.price,
						stock: product.stock,
						quantity,
					},
				];

		onDraftChange({ ...draft, catalogParts: nextParts });
		setSelectedProductId("");
		setSelectedQuantity(1);
		setProductSearch("");
	};

	const updatePartQuantity = (productId, quantity) => {
		const parsed = Math.max(1, Number(quantity) || 1);
		const part = (draft.catalogParts || []).find((item) => item.productId === productId);
		if (part && parsed > part.stock) {
			alert(`Stoc insuficient. Disponibil: ${part.stock}`);
			return;
		}

		onDraftChange({
			...draft,
			catalogParts: (draft.catalogParts || []).map((item) =>
				item.productId === productId ? { ...item, quantity: parsed } : item
			),
		});
	};

	const removePart = (productId) => {
		onDraftChange({
			...draft,
			catalogParts: (draft.catalogParts || []).filter((item) => item.productId !== productId),
		});
	};

	return (
		<div className="mt-3 rounded-lg border border-blue-700/40 bg-slate-950 p-3 sm:p-4">
			<div className="mb-3 text-sm font-semibold text-blue-200">Finalizare service</div>

			<label className="block mb-3 text-sm text-slate-200">
				Lucrări efectuate
				<textarea
					className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-white"
					rows="3"
					value={draft.worksPerformed || ""}
					onChange={(e) => updateField("worksPerformed", e.target.value)}
					placeholder="Ex: schimbat filtru ulei, verificat frâne"
				/>
			</label>

			<div className="mb-3">
				<p className="text-sm text-slate-200 mb-2">Piese din catalog</p>
				<input
					type="text"
					className="mb-2 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-white text-sm"
					placeholder="Caută piesă..."
					value={productSearch}
					onChange={(e) => setProductSearch(e.target.value)}
				/>
				<div className="flex flex-col sm:flex-row gap-2">
					<select
						className="flex-1 rounded-md border border-slate-700 bg-slate-900 p-2 text-white text-sm"
						value={selectedProductId}
						onChange={(e) => setSelectedProductId(e.target.value)}
					>
						<option value="">Selectează piesa...</option>
						{filteredProducts.map((product) => (
							<option key={product._id} value={product._id}>
								{product.name} — {product.price} RON (stoc: {product.stock})
							</option>
						))}
					</select>
					<input
						type="number"
						min="1"
						className="w-full sm:w-24 rounded-md border border-slate-700 bg-slate-900 p-2 text-white text-sm"
						value={selectedQuantity}
						onChange={(e) => setSelectedQuantity(e.target.value)}
					/>
					<button
						type="button"
						onClick={addCatalogPart}
						className="inline-flex items-center justify-center gap-1 rounded-md bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700"
					>
						<Plus size={16} /> Adaugă
					</button>
				</div>

				{(draft.catalogParts || []).length > 0 && (
					<div className="mt-3 space-y-2">
						{(draft.catalogParts || []).map((part) => (
							<div
								key={part.productId}
								className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-md border border-slate-700 bg-slate-900 p-2"
							>
								<div className="flex-1 min-w-0">
									<p className="text-sm text-white truncate">{part.name}</p>
									<p className="text-xs text-gray-400">
										{part.price} RON / buc · stoc max {part.stock}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<input
										type="number"
										min="1"
										max={part.stock}
										className="w-20 rounded-md border border-slate-700 bg-slate-950 p-1.5 text-white text-sm"
										value={part.quantity}
										onChange={(e) => updatePartQuantity(part.productId, e.target.value)}
									/>
									<span className="text-sm text-green-400 min-w-[80px] text-right">
										{(part.price * part.quantity).toFixed(0)} RON
									</span>
									<button
										type="button"
										onClick={() => removePart(part.productId)}
										className="p-1.5 text-red-400 hover:text-red-300"
										aria-label="Elimină piesa"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
				<label className="block text-sm text-slate-200">
					Ore manoperă
					<input
						type="number"
						min="0"
						step="0.5"
						className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-white"
						value={draft.laborHours || ""}
						onChange={(e) => updateField("laborHours", e.target.value)}
						placeholder="Ex: 2"
					/>
				</label>
				<label className="block text-sm text-slate-200">
					Cost manoperă (RON)
					<input
						type="number"
						min="0"
						step="1"
						className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-white"
						value={draft.laborCost || ""}
						onChange={(e) => updateField("laborCost", e.target.value)}
						placeholder="Ex: 250"
					/>
				</label>
			</div>

			<label className="block mb-3 text-sm text-slate-200">
				Notă
				<textarea
					className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-white"
					rows="2"
					value={draft.notes || ""}
					onChange={(e) => updateField("notes", e.target.value)}
					placeholder="Observații suplimentare"
				/>
			</label>

			<div className="mb-4 rounded-md border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200 space-y-1">
				<div className="flex justify-between">
					<span>Piese</span>
					<span>{partsTotal.toFixed(0)} RON</span>
				</div>
				<div className="flex justify-between">
					<span>Manoperă</span>
					<span>{laborTotal.toFixed(0)} RON</span>
				</div>
				<div className="flex justify-between font-semibold text-white pt-1 border-t border-slate-700">
					<span>Total reparație</span>
					<span>{grandTotal.toFixed(0)} RON</span>
				</div>
			</div>

			<button
				type="button"
				className="rounded-lg bg-[#2B4EE6] px-4 py-2 text-sm text-white hover:bg-[#1f3bbe] disabled:opacity-50"
				onClick={() => onSubmit(appointmentId)}
				disabled={saving}
			>
				{saving ? "Se salvează..." : "Marchează ca finalizată"}
			</button>
		</div>
	);
};

export default ServiceCompletionForm;
