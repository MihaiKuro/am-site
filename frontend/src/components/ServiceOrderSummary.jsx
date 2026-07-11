export const formatServiceCost = (entry) => {
	const parts = Number(entry.totalParts) || 0;
	const labor = Number(entry.totalLabor) || 0;
	const total = Number(entry.totalCost) || parts + labor;
	return { parts, labor, total };
};

const ServiceOrderSummary = ({ entry, className = "" }) => {
	const costs = formatServiceCost(entry);

	return (
		<div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3 ${className}`.trim()}>
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
				<p className="text-white font-medium">
					{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("ro-RO") : "-"}
				</p>
				<span className="self-start px-2.5 py-1 rounded-full text-xs bg-blue-900/50 text-blue-200 border border-blue-700">
					{entry.status || "Finalizată"}
				</span>
			</div>

			<div>
				<p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Lucrări</p>
				<p className="text-sm text-gray-300 break-words">{entry.worksPerformed || "-"}</p>
			</div>

			<div>
				<p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Piese</p>
				{entry.partsUsed?.length ? (
					<ul className="space-y-1">
						{entry.partsUsed.map((part, index) => (
							<li key={`${part.name}-${index}`} className="text-sm text-gray-300 break-words">
								{part.name}
								{part.quantity > 1 ? ` x${part.quantity}` : ""}
								{" — "}
								<span className="text-gray-400">{(part.price * part.quantity).toFixed(0)} RON</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-gray-400">-</p>
				)}
			</div>

			{entry.notes && (
				<div>
					<p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Note</p>
					<p className="text-sm text-gray-300 break-words">{entry.notes}</p>
				</div>
			)}

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-gray-700">
				<div>
					<p className="text-xs text-gray-500">Piese</p>
					<p className="text-sm text-gray-300">{costs.parts.toFixed(0)} RON</p>
				</div>
				<div>
					<p className="text-xs text-gray-500">Manoperă</p>
					<p className="text-sm text-gray-300">{costs.labor.toFixed(0)} RON</p>
				</div>
				<div>
					<p className="text-xs text-gray-500">Total</p>
					<p className="text-sm text-green-400 font-semibold">{costs.total.toFixed(0)} RON</p>
				</div>
				<div>
					<p className="text-xs text-gray-500">Mecanic</p>
					<p className="text-sm text-gray-300 break-words">{entry.mechanic?.name || "-"}</p>
				</div>
			</div>
		</div>
	);
};

export default ServiceOrderSummary;
