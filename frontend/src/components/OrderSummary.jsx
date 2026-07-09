import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import { useState } from "react";
import { toast } from "react-hot-toast";

const stripePromise = loadStripe(
	"pk_test_51RRX4nRqG6J0ltnNnb7z43YF1w3QxkCgs1IyQThg31wXDZgTevtlHNmurVuhet6awNb2QFrqntptC271iVCApama00AzTtMut1"
);

const OrderSummary = ({ onProceedToCheckout }) => {
	const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
	const [isLoading, setIsLoading] = useState(false);

	const savings = subtotal - total;
	const formattedSubtotal = subtotal.toFixed(2);
	const formattedTotal = total.toFixed(2);
	const formattedSavings = savings.toFixed(2);

	// The handlePayment function will be moved to the CheckoutModal or a later stage
	// For now, the button will trigger onProceedToCheckout

	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4 shadow-sm backdrop-blur-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-semibold text-[#2B4EE6]'>Sumar comandă</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-gray-300'>Preț inițial</dt>
						<dd className='text-base font-medium text-white'>{formattedSubtotal} ron</dd>
					</dl>

					{savings > 0 && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Economii</dt>
							<dd className='text-base font-medium text-[#2B4EE6]'>-{formattedSavings} ron</dd>
						</dl>
					)}

					{coupon && isCouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Cupon ({coupon.code})</dt>
							<dd className='text-base font-medium text-[#2B4EE6]'>-{coupon.discountPercentage}%</dd>
						</dl>
					)}
					<dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
						<dt className='text-base font-bold text-white'>Total</dt>
						<dd className='text-base font-bold text-[#2B4EE6]'>{formattedTotal} ron</dd>
					</dl>
				</div>

				<motion.button
					className='flex w-full items-center justify-center rounded-lg bg-[#2B4EE6] px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed'
					whileHover={{ scale: isLoading ? 1 : 1.05 }}
					whileTap={{ scale: isLoading ? 1 : 0.95 }}
					onClick={onProceedToCheckout}
					disabled={isLoading}
				>
					Continuă către plată
				</motion.button>

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-gray-400'>sau</span>
					<Link
						to='/'
						className='inline-flex items-center gap-2 text-sm font-medium text-[#2B4EE6] underline hover:text-blue-500 hover:no-underline'
					>
						Continuă cumpărăturile
						<MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
};
export default OrderSummary;
