import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";
import { toast } from "react-hot-toast";

const PurchaseSuccessPage = () => {
	const [isProcessing, setIsProcessing] = useState(true);
	const { clearCart } = useCartStore();
	const [error, setError] = useState(null);
	const processedSessionRef = useRef(null);

	useEffect(() => {
		const handleCheckoutSuccess = async (sessionId) => {
			const storageKey = `checkout-processed-${sessionId}`;
			if (processedSessionRef.current === sessionId || sessionStorage.getItem(storageKey)) {
				setIsProcessing(false);
				return;
			}
			processedSessionRef.current = sessionId;

			try {
				const timestamp = Date.now();
				await axios.post(`/payments/checkout-success?_t=${timestamp}`, {
					sessionId,
				}, {
					headers: {
						'Cache-Control': 'no-cache',
						'Pragma': 'no-cache'
					},
					withCredentials: true
				});

				sessionStorage.setItem(storageKey, "1");
				await clearCart();
				toast.success("Comanda a fost finalizată cu succes!");
			} catch (error) {
				console.error("Error processing checkout success:", error);
				try {
					await clearCart();
				} catch (clearError) {
					console.error("Error clearing cart:", clearError);
				}
				setError("A apărut o problemă la procesarea comenzii, dar plata a fost efectuată cu succes.");
			} finally {
				setIsProcessing(false);
			}
		};

		const sessionId = new URLSearchParams(window.location.search).get("session_id");
		if (sessionId) {
			handleCheckoutSuccess(sessionId);
		} else {
			clearCart().catch(console.error);
			setIsProcessing(false);
			setError("Nu s-a găsit session ID în URL");
		}
	}, [clearCart]);

	if (isProcessing) {
		return (
			<div className="min-h-[50vh] flex items-center justify-center py-12">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B4EE6] mx-auto mb-4"></div>
					<p className="text-gray-300">Se procesează plata...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-[50vh] flex items-center justify-center py-12 px-4">
				<div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 text-center">
					<h1 className="text-xl font-bold text-red-400 mb-4">Problemă la procesarea comenzii</h1>
					<p className="text-gray-300 mb-6">{error}</p>
					<Link
						to="/"
						className="bg-[#2B4EE6] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
					>
						Înapoi acasă
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-[50vh] flex items-center justify-center py-12 px-4'>
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				style={{ zIndex: 99 }}
				numberOfPieces={700}
				recycle={false}
			/>

			<div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10'>
				<div className='p-6 sm:p-8'>
					<div className='flex justify-center'>
						<CheckCircle className='text-[#2B4EE6] w-16 h-16 mb-4' />
					</div>
					<h1 className='text-2xl sm:text-3xl font-bold text-center text-[#2B4EE6] mb-2'>
						Purchase Successful!
					</h1>

					<p className='text-gray-300 text-center mb-2'>
						Thank you for your order. {"We're"} processing it now.
					</p>
					<p className='text-[#2B4EE6] text-center text-sm mb-6'>
						Check your email for order details and updates.
					</p>
					<div className='bg-gray-700 rounded-lg p-4 mb-6'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm text-gray-400'>Order number</span>
							<span className='text-sm font-semibold text-[#2B4EE6]'>#12345</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-gray-400'>Estimated delivery</span>
							<span className='text-sm font-semibold text-[#2B4EE6]'>3-5 business days</span>
						</div>
					</div>

					<div className='space-y-4'>
						<button
							className='w-full bg-[#2B4EE6] hover:bg-blue-600 text-white font-bold py-2 px-4
             rounded-lg transition duration-300 flex items-center justify-center'
						>
							<HandHeart className='mr-2' size={18} />
							Thanks for trusting us!
						</button>
						<Link
							to={"/"}
							className='w-full bg-gray-700 hover:bg-gray-600 text-[#2B4EE6] font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center'
						>
							Continue Shopping
							<ArrowRight className='ml-2' size={18} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
export default PurchaseSuccessPage;
