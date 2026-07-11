import { Star } from "lucide-react";

const ProductRating = ({ rating = 0, reviewCount = 0, size = 16, showCount = true }) => {
	if (!reviewCount) {
		return showCount ? (
			<span className="text-xs text-gray-500">Nicio recenzie</span>
		) : null;
	}

	return (
		<div className="flex items-center gap-1.5">
			<div className="flex items-center gap-0.5">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						size={size}
						className={
							star <= Math.round(rating)
								? "text-yellow-400 fill-yellow-400"
								: "text-gray-500"
						}
					/>
				))}
			</div>
			{showCount && (
				<span className="text-xs text-gray-400">
					{Number(rating).toFixed(1)} ({reviewCount})
				</span>
			)}
		</div>
	);
};

export default ProductRating;
