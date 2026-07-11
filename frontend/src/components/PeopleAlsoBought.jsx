import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const PeopleAlsoBought = ({ excludeProductId }) => {
	const [recommendations, setRecommendations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchRecommendations = async () => {
			try {
				const params = excludeProductId ? { exclude: excludeProductId } : {};
				const res = await axios.get("/products/recommended", { params });
				setRecommendations(res.data);
			} catch (error) {
				toast.error(error.response?.data?.message || "Nu s-au putut încărca recomandările");
			} finally {
				setIsLoading(false);
			}
		};

		fetchRecommendations();
	}, [excludeProductId]);

	if (isLoading) {
		return (
			<div className="mt-10 flex justify-center py-8">
				<LoadingSpinner />
			</div>
		);
	}

	if (recommendations.length === 0) {
		return null;
	}

	return (
		<div className='mt-10 sm:mt-12 pt-8 border-t border-gray-700'>
			<h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Alții au cumpărat</h2>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{recommendations.map((product) => (
					<ProductCard key={product._id} product={product} />
				))}
			</div>
		</div>
	);
};
export default PeopleAlsoBought;
