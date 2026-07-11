import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ProductRating from "./ProductRating";

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

	return (
		<section className="border-t border-[#2A3548] bg-[#111827] py-14 sm:py-20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{inStockProducts.length === 0 ? null : (
					<>
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-10">
							<div>
								<p className="text-[10px] uppercase tracking-[0.2em] text-[#6B7A94] mb-3">
									Selecție editor
								</p>
								<h2 className="font-hero text-2xl sm:text-3xl font-bold text-white">
									Produse recomandate
								</h2>
							</div>
							<div className="flex gap-2 self-end sm:self-auto">
								<button
									onClick={prevSlide}
									className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3D4F6F] bg-[#141B28] text-[#E8EDF5] transition-colors hover:border-[#2B4EE6] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B4EE6]"
									aria-label="Previous products"
								>
									<ChevronLeft size={20} />
								</button>
								<button
									onClick={nextSlide}
									className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3D4F6F] bg-[#141B28] text-[#E8EDF5] transition-colors hover:border-[#2B4EE6] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B4EE6]"
									aria-label="Next products"
								>
									<ChevronRight size={20} />
								</button>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
							{inStockProducts.slice(currentIndex, currentIndex + itemsPerPage).map((product) => (
								<div
									key={product._id}
									className="group overflow-hidden rounded-2xl border border-[#2A3548] bg-[#0B0F17]/80 transition-colors hover:border-[#2B4EE6]/40 w-full"
								>
									<div className="relative aspect-video w-full overflow-hidden">
										<img
											src={product.image}
											alt={product.name}
											className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
										/>
										{product.onSale && (
											<span className="absolute top-2 left-2 rounded-md bg-[#F5A623] px-2 py-1 text-xs font-semibold text-[#0B0F17]">
												REDUCERE
											</span>
										)}
									</div>
									<div className="p-4">
										<Link
											to={`/product/${product._id}`}
											className="font-hero text-base sm:text-lg font-semibold text-white hover:text-[#93AAFF] transition-colors line-clamp-2"
										>
											{product.name}
										</Link>
										<div className="my-2">
											<ProductRating rating={product.rating} reviewCount={product.reviewCount} />
										</div>
										<div className="flex items-baseline gap-2 mb-2">
											<span className="text-xl font-bold text-[#F5A623]">
												{product.price.toFixed(2)} RON
											</span>
											{product.originalPrice && (
												<span className="text-[#6B7A94] line-through text-sm">
													{product.originalPrice.toFixed(2)} RON
												</span>
											)}
										</div>
										<p className="text-[#3DD68C] text-sm mb-4">
											În stoc ({product.stock} disponibile)
										</p>
										<button
											onClick={() => handleAddToCart(product)}
											className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2B4EE6] hover:bg-[#3D63FF] text-white py-2.5 px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B4EE6]"
										>
											<ShoppingCart size={18} />
											Adaugă în coș
										</button>
									</div>
								</div>
							))}
						</div>

						<div className="text-center mt-10">
							<Link
								to="/products"
								className="inline-flex items-center justify-center rounded-lg bg-[#F5A623] px-6 py-3 text-sm sm:text-base font-semibold text-[#0B0F17] transition-colors hover:bg-[#FFBE4D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5A623]"
							>
								Vezi toate produsele
							</Link>
						</div>
					</>
				)}
			</div>
		</section>
	);
};

export default FeaturedProducts;
