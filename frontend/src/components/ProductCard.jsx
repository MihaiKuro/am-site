import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import ProductRating from "./ProductRating";

const ProductCard = ({ product }) => {
	const { user } = useUserStore();
	const { addToCart } = useCartStore();

	const handleAddToCart = (e) => {
		e.preventDefault();
		e.stopPropagation();
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

	return (
		<Link
			to={`/product/${product._id}`}
			className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-lg hover:border-[#2B4EE6]/50 transition-colors'
		>
			<div className='relative mx-3 mt-3 flex h-44 sm:h-52 md:h-60 overflow-hidden rounded-xl'>
				<img className='object-cover w-full' src={product.image} alt={product.name} />
				<div className='absolute inset-0 bg-black bg-opacity-20' />
			</div>

			<div className='mt-4 px-5 pb-5 flex flex-col flex-1'>
				<h5 className='text-xl font-semibold tracking-tight text-white line-clamp-2'>{product.name}</h5>
				<div className="mt-2 mb-3">
					<ProductRating rating={product.rating} reviewCount={product.reviewCount} />
				</div>
				<div className='mt-2 mb-5 flex items-center justify-between'>
					<p>
						<span className='text-2xl sm:text-3xl font-bold text-[#2B4EE6]'>{product.price} ron</span>
					</p>
				</div>
				<div className='mb-4 flex items-center'>
					<span className={`text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
						{product.stock > 0 ? `În stoc (${product.stock} disponibile)` : 'Stoc epuizat'}
					</span>
				</div>
				<button
					className='mt-auto flex items-center justify-center rounded-lg bg-[#2B4EE6] px-5 py-2.5 text-center text-sm font-medium
					 text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed'
					onClick={handleAddToCart}
					disabled={product.stock <= 0}
				>
					<ShoppingCart size={22} className='mr-2' />
					{product.stock <= 0 ? 'Stoc epuizat' : 'Adaugă în coș'}
				</button>
			</div>
		</Link>
	);
};

export default ProductCard;
