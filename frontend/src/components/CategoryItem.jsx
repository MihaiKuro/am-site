import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CategoryItem = ({ category }) => {
	return (
		<motion.div
			className='relative overflow-hidden h-80 w-full rounded-lg group bg-gray-800/50 backdrop-blur-sm border border-gray-700'
			whileHover={{ scale: 1.02 }}
			transition={{ duration: 0.2 }}
		>
			<Link to={category.href}>
				<div className='w-full h-full cursor-pointer'>
					<div className='absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900 z-10' />
					<img
						src={category.imageUrl}
						alt={category.name}
						className='w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110'
						loading='lazy'
					/>
					<div className='absolute bottom-0 left-0 right-0 p-6 z-20'>
						<h3 className='text-white text-2xl font-bold mb-2'>{category.name}</h3>
						<div className='flex items-center'>
							<p className='text-gray-200 text-sm group-hover:text-[#2B4EE6] transition-colors'>
								Explore {category.name}
							</p>
							<svg
								className='w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1 text-[#2B4EE6] opacity-0 group-hover:opacity-100'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M13 7l5 5m0 0l-5 5m5-5H6'
								/>
							</svg>
						</div>
					</div>
				</div>
			</Link>
		</motion.div>
	);
};

export default CategoryItem;
