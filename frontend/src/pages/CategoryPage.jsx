import { useEffect } from "react";
import { useCategoryStore } from "../stores/useCategoryStore";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

const CategoryPage = () => {
	const { categories, fetchCategories } = useCategoryStore();
	const { category: categorySlug } = useParams();

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const currentCategory = categories.find(cat => cat.slug === categorySlug);
	const categoryName = currentCategory?.name || "";
	const subcategories = currentCategory?.subcategories || [];

	return (
		<div className='min-h-screen bg-[#0B0F17]'>
			<div className='relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				<div className='text-center space-y-4 mb-12'>
					<motion.h1
						className='text-4xl sm:text-5xl font-bold text-[#2B4EE6]'
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						{categoryName}
					</motion.h1>
					<motion.p
						className='text-gray-400 text-lg max-w-2xl mx-auto'
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						{categoryName && `Vezi colecția noastră de ${categoryName.toLowerCase()} pe subcategorii`}
					</motion.p>
				</div>

				<motion.div
					className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					{subcategories.length === 0 ? (
						<div className='col-span-full flex flex-col items-center justify-center py-16 px-4'>
							<h2 className='text-2xl font-semibold text-gray-300 text-center mb-4'>
								Nu am găsit subcategorii
							</h2>
							<p className='text-gray-400 text-center max-w-md'>
								Nu am găsit subcategorii în această categorie. Revino mai târziu sau explorează alte categorii.
							</p>
						</div>
					) : (
						subcategories.map((subcategory) => (
							<Link
								key={subcategory._id}
								to={`/category/${categorySlug}/${subcategory.slug}`}
								className='group relative overflow-hidden rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300'
							>
								<div className='aspect-w-16 aspect-h-9'>
									<img
										src={subcategory.image || currentCategory.image}
										alt={subcategory.name}
										className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
									/>
								</div>
								<div className='absolute inset-0 bg-gradient-to-t from-black/80 to-transparent'></div>
								<div className='absolute bottom-0 left-0 right-0 p-4'>
									<h3 className='text-xl font-semibold text-white mb-1'>{subcategory.name}</h3>
									<p className='text-sm text-gray-300'>Vezi {subcategory.name}</p>
								</div>
							</Link>
						))
					)}
				</motion.div>
			</div>
		</div>
	);
};

export default CategoryPage;