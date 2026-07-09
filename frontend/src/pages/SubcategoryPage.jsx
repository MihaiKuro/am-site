import { useEffect } from "react";
import { useCategoryStore } from "../stores/useCategoryStore";
import { useProductStore } from "../stores/useProductStore";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";

const SubcategoryPage = () => {
	const { categories, fetchCategories } = useCategoryStore();
	const { fetchProductsBySubcategory, products, loading } = useProductStore();
	const { category: categorySlug, subcategory: subcategorySlug } = useParams();

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const currentCategory = categories.find(cat => cat.slug === categorySlug);
	const currentSubcategory = currentCategory?.subcategories?.find(sub => sub.slug === subcategorySlug);

	useEffect(() => {
		if (currentSubcategory?._id) {
			fetchProductsBySubcategory(currentSubcategory._id);
		}
	}, [currentSubcategory, fetchProductsBySubcategory]);

	const categoryName = currentCategory?.name || "";
	const subcategoryName = currentSubcategory?.name || "";

	return (
		<div className='min-h-screen bg-[#0B0F17]'>
			<div className='relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				<div className='text-center space-y-4 mb-12'>
					<motion.div
						className='flex items-center justify-center space-x-2 text-gray-400 mb-4'
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<Link to="/" className='hover:text-white transition-colors'>Home</Link>
						<span>/</span>
						<Link to={`/category/${categorySlug}`} className='hover:text-white transition-colors'>{categoryName}</Link>
						<span>/</span>
						<span className='text-white'>{subcategoryName}</span>
					</motion.div>
					<motion.h1
						className='text-4xl sm:text-5xl font-bold text-[#2B4EE6]'
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						{subcategoryName}
					</motion.h1>
					<motion.p
						className='text-gray-400 text-lg max-w-2xl mx-auto'
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						{subcategoryName && `Vezi colecția noastră de produse ${subcategoryName.toLowerCase()} pe subcategorii`}
					</motion.p>
				</div>

				<motion.div
					className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					{loading ? (
						<div className='col-span-full flex justify-center items-center py-16'>
							<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2B4EE6]'></div>
						</div>
					) : products.length === 0 ? (
						<div className='col-span-full flex flex-col items-center justify-center py-16 px-4'>
							<h2 className='text-2xl font-semibold text-gray-300 text-center mb-4'>
								Nu am găsit produse
							</h2>
							<p className='text-gray-400 text-center max-w-md'>
								Nu am găsit produse în această subcategorie. Revino mai târziu sau explorează alte categorii.
							</p>
						</div>
					) : (
						products.map((product) => (
							<ProductCard key={product._id} product={product} />
						))
					)}
				</motion.div>
			</div>
		</div>
	);
};

export default SubcategoryPage; 