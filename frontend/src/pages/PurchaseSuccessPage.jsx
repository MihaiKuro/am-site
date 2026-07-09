import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";
import { toast } from "react-hot-toast";

const PurchaseSuccessPage = () => {
	const [isProcessing, setIsProcessing] = useState(true);
	const { clearCart } = useCartStore();
	const [error, setError] = useState(null);

	useEffect(() => {
		const handleCheckoutSuccess = async (sessionId) => {
			try {
				// Process the successful payment with full URL to avoid any axios config issues
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
				
				// Clear the cart after successful payment
				await clearCart();
				toast.success("Order completed successfully! Your cart has been cleared.");
				
			} catch (error) {
				console.error("Error processing checkout success:", error);
				// Even if there's an error, try to clear the cart
				try {
					await clearCart();
				} catch (clearError) {
					console.error("Error clearing cart:", clearError);
				}
				setError("There was an issue processing your order, but your payment was successful.");
			} finally {
				setIsProcessing(false);
			}
		};

		const sessionId = new URLSearchParams(window.location.search).get("session_id");
		if (sessionId) {
			handleCheckoutSuccess(sessionId);
		} else {
			// If no session ID, still try to clear cart (in case user navigates directly)
			clearCart().catch(console.error);
			setIsProcessing(false);
			setError("No session ID found in the URL");
		}
	}, [clearCart]);

	if (isProcessing) {
		return (
			<div className="h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B4EE6] mx-auto mb-4"></div>
					<p className="text-gray-300">Processing your payment...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-screen flex items-center justify-center px-4">
				<div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 text-center">
					<h1 className="text-xl font-bold text-red-400 mb-4">Payment Processing Issue</h1>
					<p className="text-gray-300 mb-6">{error}</p>
					<Link
						to="/"
						className="bg-[#2B4EE6] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
					>
						Return to Home
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='h-screen flex items-center justify-center px-4'>
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
