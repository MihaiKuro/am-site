import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";

const StarRating = ({ value, onChange, readonly = false, size = 18 }) => (
	<div className="flex items-center gap-1">
		{[1, 2, 3, 4, 5].map((star) => (
			<button
				key={star}
				type="button"
				disabled={readonly}
				onClick={() => onChange?.(star)}
				className={readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}
				aria-label={`${star} stele`}
			>
				<Star
					size={size}
					className={
						star <= value
							? "text-yellow-400 fill-yellow-400"
							: "text-gray-500"
					}
				/>
			</button>
		))}
	</div>
);

const ProductReviews = ({ productId, onStatsChange }) => {
	const { user } = useUserStore();
	const [reviews, setReviews] = useState([]);
	const [averageRating, setAverageRating] = useState(0);
	const [reviewCount, setReviewCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState("");

	const userReview = reviews.find(
		(review) => review.user?._id === user?._id || review.user === user?._id
	);

	const fetchReviews = useCallback(async () => {
		setLoading(true);
		try {
			const response = await axios.get(`/reviews/product/${productId}`);
			setReviews(response.data.reviews || []);
			setAverageRating(response.data.averageRating || 0);
			setReviewCount(response.data.reviewCount || 0);
			onStatsChange?.({
				rating: response.data.averageRating || 0,
				reviewCount: response.data.reviewCount || 0,
			});
		} catch (error) {
			toast.error(error.response?.data?.message || "Nu s-au putut încărca recenziile");
		} finally {
			setLoading(false);
		}
	}, [productId, onStatsChange]);

	useEffect(() => {
		if (productId) {
			fetchReviews();
		}
	}, [productId, fetchReviews]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!user) {
			toast.error("Autentifică-te pentru a lăsa o recenzie");
			return;
		}

		if (!comment.trim()) {
			toast.error("Scrie o opinie despre produs");
			return;
		}

		setSubmitting(true);
		try {
			await axios.post(`/reviews/product/${productId}`, {
				rating,
				comment: comment.trim(),
			});
			setComment("");
			setRating(5);
			toast.success("Recenzia ta a fost publicată");
			await fetchReviews();
		} catch (error) {
			toast.error(error.response?.data?.message || "Nu s-a putut publica recenzia");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (reviewId) => {
		if (!window.confirm("Sigur vrei să ștergi această recenzie?")) return;

		try {
			await axios.delete(`/reviews/${reviewId}`);
			toast.success("Recenzia a fost ștearsă");
			await fetchReviews();
		} catch (error) {
			toast.error(error.response?.data?.message || "Nu s-a putut șterge recenzia");
		}
	};

	const getUserName = (reviewUser) => {
		if (!reviewUser) return "Utilizator";
		const name = `${reviewUser.firstName || ""} ${reviewUser.lastName || ""}`.trim();
		return name || "Utilizator";
	};

	return (
		<div className="mt-10 sm:mt-12 pt-8 border-t border-gray-700">
			<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-white">Opinii și recenzii</h2>
					<p className="text-gray-400 text-sm mt-1">
						{reviewCount > 0
							? `${reviewCount} ${reviewCount === 1 ? "recenzie" : "recenzii"}`
							: "Nicio recenzie încă"}
					</p>
				</div>
				{reviewCount > 0 && (
					<div className="flex items-center gap-3">
						<span className="text-3xl font-bold text-[#2B4EE6]">
							{averageRating.toFixed(1)}
						</span>
						<StarRating value={Math.round(averageRating)} readonly size={20} />
					</div>
				)}
			</div>

			{user ? (
				userReview ? (
					<p className="mb-6 text-sm text-gray-400 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
						Ai lăsat deja o recenzie pentru acest produs.
					</p>
				) : (
					<form
						onSubmit={handleSubmit}
						className="mb-8 bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-5 space-y-4"
					>
						<h3 className="text-lg font-semibold text-white">Lasă o recenzie</h3>
						<div>
							<label className="block text-sm text-gray-400 mb-2">Nota ta</label>
							<StarRating value={rating} onChange={setRating} />
						</div>
						<div>
							<label htmlFor="review-comment" className="block text-sm text-gray-400 mb-2">
								Opinia ta
							</label>
							<textarea
								id="review-comment"
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								rows={4}
								maxLength={1000}
								placeholder="Spune-ne ce părere ai despre produs..."
								className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6]"
								required
							/>
						</div>
						<button
							type="submit"
							disabled={submitting}
							className="bg-[#2B4EE6] hover:bg-blue-600 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
						>
							{submitting ? "Se publică..." : "Publică recenzia"}
						</button>
					</form>
				)
			) : (
				<p className="mb-8 text-sm text-gray-400">
					<Link to="/login" className="text-[#2B4EE6] hover:underline">
						Autentifică-te
					</Link>
					{" "}pentru a lăsa o recenzie.
				</p>
			)}

			{loading ? (
				<p className="text-gray-400 text-sm">Se încarcă recenziile...</p>
			) : reviews.length === 0 ? (
				<p className="text-gray-400 text-sm">Fii primul care lasă o opinie despre acest produs.</p>
			) : (
				<div className="space-y-4">
					{reviews.map((review) => {
						const canDelete =
							user &&
							(user._id === review.user?._id ||
								user._id === review.user ||
								user.role === "admin");

						return (
							<article
								key={review._id}
								className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 sm:p-5"
							>
								<div className="flex items-start justify-between gap-3 mb-3">
									<div>
										<p className="font-medium text-white">{getUserName(review.user)}</p>
										<p className="text-xs text-gray-500 mt-1">
											{review.createdAt
												? new Date(review.createdAt).toLocaleDateString("ro-RO")
												: ""}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<StarRating value={review.rating} readonly size={16} />
										{canDelete && (
											<button
												type="button"
												onClick={() => handleDelete(review._id)}
												className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
												aria-label="Șterge recenzia"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										)}
									</div>
								</div>
								<p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
									{review.comment}
								</p>
							</article>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ProductReviews;
