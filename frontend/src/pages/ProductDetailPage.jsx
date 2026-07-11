import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import ProductReviews from "../components/ProductReviews";
import { Star } from "lucide-react";

const ProductDetailPage = () => {
	const { id } = useParams();
	const { user } = useUserStore();
	const { addToCart } = useCartStore();
	const [product, setProduct] = useState(null);
	const [reviewStats, setReviewStats] = useState({ rating: 0, reviewCount: 0 });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchProduct = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await axios.get(`/products/${id}`);
				setProduct(response.data);
				setReviewStats({
					rating: response.data.rating || 0,
					reviewCount: response.data.reviewCount || 0,
				});
			} catch (err) {
				setError(err.response?.data?.message || "Produsul nu a fost găsit");
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchProduct();
		}
	}, [id]);

	const handleAddToCart = () => {
		if (!user) {
			toast.error("Autentifică-te pentru a adăuga produse în coș");
			return;
		}
		if (product.stock <= 0) {
			toast.error("Produsul nu este în stoc");
			return;
		}
		addToCart(product);
	};

	if (loading) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	if (error || !product) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
				<h1 className="text-2xl font-bold text-white mb-3">Produs indisponibil</h1>
				<p className="text-gray-400 mb-6">{error || "Nu am găsit produsul solicitat."}</p>
				<Link
					to="/categories"
					className="inline-flex items-center gap-2 bg-[#2B4EE6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Înapoi la categorii
				</Link>
			</div>
		);
	}

	const category = product.category;
	const subcategory = product.subcategory;

	return (
		<div className="min-h-screen bg-[#0B0F17]">
			<div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				<motion.nav
					className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-6 sm:mb-8"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<Link to="/" className="hover:text-white transition-colors">Acasă</Link>
					<span>/</span>
					<Link to="/categories" className="hover:text-white transition-colors">Categorii</Link>
					{category?.slug && (
						<>
							<span>/</span>
							<Link to={`/category/${category.slug}`} className="hover:text-white transition-colors">
								{category.name}
							</Link>
						</>
					)}
					{category?.slug && subcategory?.slug && (
						<>
							<span>/</span>
							<Link
								to={`/category/${category.slug}/${subcategory.slug}`}
								className="hover:text-white transition-colors"
							>
								{subcategory.name}
							</Link>
						</>
					)}
					<span>/</span>
					<span className="text-white line-clamp-1">{product.name}</span>
				</motion.nav>

				<motion.div
					className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<div className="rounded-2xl overflow-hidden border border-gray-700 bg-gray-800/50 aspect-square lg:aspect-auto lg:min-h-[420px]">
						<img
							src={product.image}
							alt={product.name}
							className="w-full h-full object-cover"
						/>
					</div>

					<div className="flex flex-col">
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
							{product.name}
						</h1>

						{(reviewStats.reviewCount > 0 || product.reviewCount > 0) && (
							<div className="flex items-center gap-2 mb-4">
								<div className="flex items-center gap-1">
									{[1, 2, 3, 4, 5].map((star) => (
										<Star
											key={star}
											size={18}
											className={
												star <= Math.round(reviewStats.rating || product.rating || 0)
													? "text-yellow-400 fill-yellow-400"
													: "text-gray-500"
											}
										/>
									))}
								</div>
								<span className="text-sm text-gray-400">
									{(reviewStats.rating || product.rating || 0).toFixed(1)} ·{" "}
									{reviewStats.reviewCount || product.reviewCount}{" "}
									{(reviewStats.reviewCount || product.reviewCount) === 1 ? "recenzie" : "recenzii"}
								</span>
							</div>
						)}

						<div className="flex flex-wrap items-center gap-3 mb-6">
							<p className="text-3xl sm:text-4xl font-bold text-[#2B4EE6]">
								{Number(product.price).toFixed(2)} RON
							</p>
							<span
								className={`text-sm font-medium px-3 py-1 rounded-full ${
									product.stock > 0
										? "bg-green-500/15 text-green-400"
										: "bg-red-500/15 text-red-400"
								}`}
							>
								{product.stock > 0
									? `În stoc (${product.stock} disponibile)`
									: "Stoc epuizat"}
							</span>
						</div>

						{(category || subcategory) && (
							<div className="mb-6 space-y-1 text-sm">
								{category && (
									<p className="text-gray-400">
										<span className="text-gray-500">Categorie: </span>
										{category.name}
									</p>
								)}
								{subcategory && (
									<p className="text-gray-400">
										<span className="text-gray-500">Subcategorie: </span>
										{subcategory.name}
									</p>
								)}
							</div>
						)}

						<div className="mb-8">
							<h2 className="text-lg font-semibold text-white mb-3">Descriere</h2>
							<p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
								{product.description || "Nu există descriere pentru acest produs."}
							</p>
						</div>

						<div className="mt-auto flex flex-col sm:flex-row gap-3">
							<button
								onClick={handleAddToCart}
								disabled={product.stock <= 0}
								className="flex-1 inline-flex items-center justify-center gap-2 bg-[#2B4EE6] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors"
							>
								<ShoppingCart className="h-5 w-5" />
								{product.stock <= 0 ? "Stoc epuizat" : "Adaugă în coș"}
							</button>
							<Link
								to={category?.slug && subcategory?.slug
									? `/category/${category.slug}/${subcategory.slug}`
									: "/categories"}
								className="inline-flex items-center justify-center gap-2 border border-gray-600 hover:bg-gray-800 text-gray-200 font-medium px-6 py-3 rounded-lg transition-colors"
							>
								<ArrowLeft className="h-4 w-4" />
								Înapoi
							</Link>
						</div>
					</div>
				</motion.div>

				<ProductReviews
					productId={product._id}
					onStatsChange={setReviewStats}
				/>

				<PeopleAlsoBought excludeProductId={product._id} />
			</div>
		</div>
	);
};

export default ProductDetailPage;
