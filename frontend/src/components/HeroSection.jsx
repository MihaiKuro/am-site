import { Link } from "react-router-dom";
import { ArrowRight, Package, Truck, Wrench } from "lucide-react";

const TRUST_ITEMS = [
	{
		icon: Package,
		label: "OEM & Aftermarket",
		desc: "Piese originale și compatibile",
	},
	{
		icon: Wrench,
		label: "Service integrat",
		desc: "Montaj direct în atelier",
	},
	{
		icon: Truck,
		label: "Livrare rapidă",
		desc: "Curier sau ridicare din magazin",
	},
];

const HeroSection = () => {
	return (
		<section className="relative overflow-hidden bg-[#0B0F17]">
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.35]"
				aria-hidden="true"
				style={{
					backgroundImage: `
						linear-gradient(rgba(43, 78, 230, 0.08) 1px, transparent 1px),
						linear-gradient(90deg, rgba(43, 78, 230, 0.08) 1px, transparent 1px)
					`,
					backgroundSize: "48px 48px",
				}}
			/>
			<div
				className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-[#2B4EE6]/25 blur-[100px]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full bg-[#F5A623]/10 blur-[80px]"
				aria-hidden="true"
			/>

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
				<div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
					<div className="space-y-6 sm:space-y-8">
						<p className="inline-flex items-center gap-2 rounded-full border border-[#2B4EE6]/40 bg-[#2B4EE6]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#93AAFF]">
							<span className="h-1.5 w-1.5 rounded-full bg-[#F5A623]" aria-hidden="true" />
							Magazin & service auto
						</p>

						<div className="space-y-3">
							<h1 className="font-hero text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.05] tracking-tight text-white">
								Piese auto
								<br />
								<span className="text-[#E8EDF5]">de calitate</span>
							</h1>
							<p className="font-hero text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#F5A623]">
								Pentru orice vehicul
							</p>
						</div>

						<p className="max-w-xl text-base sm:text-lg leading-relaxed text-[#9CA8BC]">
							Găsește piesele potrivite din catalogul nostru OEM și aftermarket — cu opțiune de montaj
							în service.
						</p>

						<div>
							<Link
								to="/categories"
								className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#F5A623] px-6 py-3.5 text-sm sm:text-base font-semibold text-[#0B0F17] transition-colors hover:bg-[#FFBE4D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5A623]"
							>
								Cumpără acum
								<ArrowRight
									className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
									aria-hidden="true"
								/>
							</Link>
						</div>
					</div>

					<div className="relative">
						<div
							className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#2B4EE6]/50 via-transparent to-[#F5A623]/30"
							aria-hidden="true"
						/>
						<div className="relative rounded-2xl border border-[#2A3548] bg-[#111827]/90 p-5 sm:p-6 backdrop-blur-sm">
							<div className="mb-5 border-b border-[#2A3548] pb-4">
								<p className="text-[10px] uppercase tracking-[0.2em] text-[#6B7A94]">Catalog activ</p>
								<p className="mt-1 text-sm font-medium text-white">Componente disponibile</p>
							</div>

							<ul className="space-y-3">
								{TRUST_ITEMS.map(({ icon: Icon, label, desc }) => (
									<li
										key={label}
										className="flex items-start gap-3 rounded-xl border border-[#243044] bg-[#0B0F17]/60 p-3.5 transition-colors hover:border-[#2B4EE6]/40"
									>
										<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2B4EE6]/15 text-[#93AAFF]">
											<Icon className="h-4 w-4" aria-hidden="true" />
										</span>
										<div>
											<p className="text-sm font-semibold text-white">{label}</p>
											<p className="mt-0.5 text-xs text-[#8B98AD]">{desc}</p>
										</div>
									</li>
								))}
							</ul>

							<svg
								className="pointer-events-none absolute -right-3 -bottom-3 h-24 w-24 text-[#2B4EE6]/15 motion-reduce:opacity-50"
								viewBox="0 0 100 100"
								fill="none"
								aria-hidden="true"
							>
								<circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
								<circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="1" />
								<circle cx="50" cy="50" r="6" fill="currentColor" />
							</svg>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
