import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { useCategoryStore } from "../stores/useCategoryStore";
import FeaturedProducts from "../components/FeaturedProducts";
import ServiceAppointment from "../components/ServiceAppointment";

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
			{/* Hero Section */}
			<div className='bg-[#2B4EE6] py-10 sm:py-16'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center'>
						<div className='space-y-4 sm:space-y-6'>
							<h1 className='text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight'>
								Piese auto de calitate
							</h1>
							<h2 className='text-xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 leading-snug'>
								Pentru orice vehicul
							</h2>
							<p className='text-base sm:text-lg text-gray-200 max-w-lg'>
								Găsește piesele perfecte pentru mașina ta din colecția noastră extinsă de componente OEM și aftermarket.
							</p>
							<div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
								<Link
									to="/categories"
									className='inline-flex items-center justify-center px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition duration-300'
								>
									Cumpără acum
									<svg className='ml-2 w-5 h-5 shrink-0' viewBox='0 0 20 20' fill='currentColor'>
										<path fillRule='evenodd' d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z' clipRule='evenodd' />
									</svg>
								</Link>
								<button
									className='inline-flex items-center justify-center px-6 py-3 bg-transparent hover:bg-blue-700 text-white font-semibold rounded-lg border-2 border-white transition duration-300 text-sm sm:text-base'
								>
									Caută piese după vehicul
								</button>
							</div>
						</div>
						<div className='hidden md:block'>
							<img
								src="/auto-parts-collection.jpg"
								alt="Auto parts collection"
								className='w-full h-auto rounded-lg shadow-xl'
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Featured Categories Section */}
			<div className='bg-[#0B0F17] py-10 sm:py-16'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-8 sm:mb-12'>
						<h2 className='text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4'>Cumpără după categorie</h2>
						<p className='text-sm sm:text-base text-gray-400 max-w-2xl mx-auto px-2'>
							Explorează colecția noastră extinsă de piese auto organizate pe categorii pentru a găsi exact ceea ce ai nevoie
						</p>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
						{featuredCategories.map((category) => (
							<Link
								key={category._id}
								to={`/category/${category.slug}`}
								className='group relative overflow-hidden rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 aspect-video min-h-[160px]'
							>
								<img
									src={category.image}
									alt={category.name}
									className='absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/80 to-transparent'></div>
								<div className='absolute bottom-0 left-0 right-0 p-3 sm:p-4'>
									<h3 className='text-lg sm:text-xl font-semibold text-white mb-0.5 sm:mb-1'>{category.name}</h3>
									<p className='text-xs sm:text-sm text-gray-300'>Vezi {category.name}</p>
								</div>
							</Link>
						))}
					</div>

					<div className='text-center mt-8'>
						<Link
							to="/categories"
							className='inline-flex items-center px-6 py-3 bg-[#2B4EE6] hover:bg-blue-500 text-white font-semibold rounded-lg transition duration-300'
						>
							Vezi toate categoriile
						</Link>
					</div>
				</div>
			</div>

			{/* Featured Products Section */}
			{!loading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			{!loading && <ServiceAppointment />}
		</div>
	);
};

export default HomePage;
