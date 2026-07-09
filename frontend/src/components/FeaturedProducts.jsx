import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const FeaturedProducts = ({ featuredProducts }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(4);
	const { addToCart } = useCartStore();

	const inStockProducts = featuredProducts.filter((product) => product.stock > 0);

	useEffect(() => {
		setCurrentIndex(0);
	}, [inStockProducts.length, itemsPerPage]);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 640) setItemsPerPage(1);
			else if (window.innerWidth < 1024) setItemsPerPage(2);
			else if (window.innerWidth < 1280) setItemsPerPage(3);
			else setItemsPerPage(4);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => 
			prevIndex + itemsPerPage >= inStockProducts.length ? 0 : prevIndex + itemsPerPage
		);
	};

	const prevSlide = () => {
		setCurrentIndex((prevIndex) => 
			prevIndex === 0 ? Math.max(0, inStockProducts.length - itemsPerPage) : prevIndex - itemsPerPage
		);
	};

	const handleAddToCart = (product) => {
		if (product.stock <= 0) {
			toast.error("Produsul nu este în stoc");
			return;
		}
		addToCart(product);
	};

	const renderStars = (rating) => {
		return [...Array(5)].map((_, index) => (
			<Star
				key={index}
				size={16}
				className={`${
					index < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
				}`}
			/>
		));
	};

	return (
		<div className='py-10 sm:py-16 bg-gray-900'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				{inStockProducts.length === 0 ? null : (
				<>
				<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8'>
					<h2 className='text-xl sm:text-2xl font-bold text-white'>Produse recomandate</h2>
					<div className='flex gap-2 self-end sm:self-auto'>
						<button
							onClick={prevSlide}
							className='p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors'
							aria-label="Previous products"
						>
							<ChevronLeft size={24} />
						</button>
						<button
							onClick={nextSlide}
							className='p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors'
							aria-label="Next products"
						>
							<ChevronRight size={24} />
						</button>
					</div>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
					{inStockProducts
						.slice(currentIndex, currentIndex + itemsPerPage)
						.map((product) => (
							<div
								key={product._id}
								className='bg-gray-800 rounded-lg overflow-hidden group w-full'
							>
								<div className='relative aspect-video w-full'>
									<img
										src={product.image}
										alt={product.name}
										className='w-full h-full object-cover'
									/>
									{product.onSale && (
										<span className='absolute top-2 left-2 bg-red-500 text-white text-sm font-semibold px-2 py-1 rounded'>
											SALE
										</span>
									)}
								</div>
								<div className='p-3 sm:p-4'>
									<Link 
										to={`/product/${product._id}`}
										className='text-base sm:text-lg font-semibold text-white hover:text-blue-400 transition-colors line-clamp-2'
									>
										{product.name}
									</Link>
									<div className='flex items-center gap-1 my-2'>
										{renderStars(product.rating)}
										<span className='text-gray-400 text-sm ml-1'>
											({product.reviewCount})
										</span>
									</div>
									<div className='flex items-baseline gap-2 mb-2'>
										<span className='text-xl font-bold text-white'>
											{product.price.toFixed(2)} ron
										</span>
										{product.originalPrice && (
											<span className='text-gray-400 line-through text-sm'>
												${product.originalPrice.toFixed(2)}
											</span>
										)}
									</div>
									<p className='text-green-400 text-sm mb-4'>
										În stoc ({product.stock} disponibile)
									</p>
									<button
										onClick={() => handleAddToCart(product)}
										className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors'
									>
										<ShoppingCart size={20} />
										Adaugă în coș
									</button>
								</div>
							</div>
						))}
				</div>

				<div className='text-center mt-8'>
					<Link
						to='/products'
						className='inline-flex items-center px-6 py-3 bg-[#2B4EE6] hover:bg-blue-500 text-white font-semibold rounded-lg transition duration-300'
					>
						Vezi toate produsele
					</Link>
				</div>
				</>
				)}
			</div>
		</div>
	);
};

export default FeaturedProducts;
