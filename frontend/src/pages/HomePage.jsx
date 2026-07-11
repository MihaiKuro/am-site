import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { useCategoryStore } from "../stores/useCategoryStore";
import FeaturedProducts from "../components/FeaturedProducts";
import ServiceAppointment from "../components/ServiceAppointment";
import HeroSection from "../components/HeroSection";

const HomePage = () => {
	const { fetchFeaturedProducts, products, loading } = useProductStore();
	const { categories, fetchCategories } = useCategoryStore();

	useEffect(() => {
		fetchFeaturedProducts();
		fetchCategories();
	}, [fetchFeaturedProducts, fetchCategories]);

	// Get first 4 categories for featured section
	const featuredCategories = categories.slice(0, 4);

	return (
		<div className='relative min-h-screen text-white overflow-x-hidden'>
			<HeroSection />

			{/* Featured Categories Section */}
			<section className="relative border-t border-[#2A3548] bg-[#0B0F17] py-14 sm:py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-8 sm:mb-12 max-w-2xl">
						<p className="text-[10px] uppercase tracking-[0.2em] text-[#6B7A94] mb-3">
							Explorează catalogul
						</p>
						<h2 className="font-hero text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
							Cumpără după categorie
						</h2>
						<p className="text-sm sm:text-base text-[#9CA8BC] leading-relaxed">
							Explorează colecția noastră extinsă de piese auto organizate pe categorii pentru a găsi exact ceea ce ai nevoie
						</p>
					</div>

					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
						{featuredCategories.map((category) => (
							<Link
								key={category._id}
								to={`/category/${category.slug}`}
								className="group flex flex-col overflow-hidden rounded-xl border border-[#2A3548] bg-[#111827] transition-colors hover:border-[#2B4EE6]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B4EE6]"
							>
								<div className="relative h-20 sm:h-24 overflow-hidden bg-[#0B0F17]">
									<img
										src={category.image}
										alt=""
										className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
									/>
								</div>
								<div className="bg-[#111827] px-2.5 sm:px-3 py-2 sm:py-2.5 border-t border-[#2A3548]">
									<h3 className="font-hero text-sm sm:text-base font-bold text-white leading-tight line-clamp-2">
										{category.name}
									</h3>
									<p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-[#F5A623] group-hover:text-[#FFBE4D] transition-colors">
										Vezi categoria →
									</p>
								</div>
							</Link>
						))}
					</div>

					<div className="text-center mt-10">
						<Link
							to="/categories"
							className="inline-flex items-center justify-center rounded-lg border border-[#3D4F6F] bg-[#141B28]/80 px-6 py-3 text-sm sm:text-base font-semibold text-white transition-colors hover:border-[#2B4EE6] hover:bg-[#1A2332] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B4EE6]"
						>
							Vezi toate categoriile
						</Link>
					</div>
				</div>
			</section>

			{/* Featured Products Section */}
			{!loading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			{!loading && (
				<section className="border-t border-[#2A3548] bg-[#0B0F17] pb-14 sm:pb-20">
					<ServiceAppointment />
				</section>
			)}
		</div>
	);
};

export default HomePage;
