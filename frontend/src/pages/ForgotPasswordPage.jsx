import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, Loader, ArrowLeft } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState("request");
	const [token, setToken] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [resetUrl, setResetUrl] = useState("");
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const tokenFromUrl = searchParams.get("token");
		if (tokenFromUrl) {
			setToken(tokenFromUrl);
			setStep("reset");
		}
	}, [searchParams]);

	const handleRequestReset = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await axios.post("/auth/request-password-reset", { email });
			toast.success(response.data.message || "Reset request sent");
			if (response.data.resetUrl) {
				setResetUrl(response.data.resetUrl);
			}
			setStep("check-email");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to process request");
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		setLoading(true);
		try {
			const response = await axios.post("/auth/reset-password", { token, newPassword });
			toast.success(response.data.message || "Password updated");
			setStep("done");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to reset password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full'>
				<motion.div
					className='bg-gray-800 rounded-lg shadow-xl p-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className='text-center mb-8'>
						<h2 className='text-3xl font-bold text-white mb-2'>Recuperează parola</h2>
						<p className='text-sm text-gray-400'>Introdu adresa de email și vei primi un token de reset.</p>
					</div>

					{step === "request" && (
						<form onSubmit={handleRequestReset} className='space-y-6'>
							<div>
								<label htmlFor='email' className='block text-sm font-medium text-gray-400 mb-2'>Adresă de email</label>
								<div className='relative'>
									<Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
									<input
										id='email'
										type='email'
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className='w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent transition duration-200'
										placeholder='Introdu adresa de email'
									/>
								</div>
							</div>

							<button type='submit' disabled={loading} className='w-full flex items-center justify-center px-4 py-3 rounded-lg bg-[#2B4EE6] text-white font-medium hover:bg-blue-600 transition duration-200 disabled:opacity-50'>
								{loading ? <Loader className='animate-spin h-5 w-5' /> : "Trimite cererea"}
							</button>
						</form>
					)}

					{step === "check-email" && (
						<div className='space-y-4 text-center'>
							<p className='text-gray-300'>Verifică email-ul pentru link-ul de resetare.</p>
							<p className='text-sm text-gray-400'>Dacă ai deschis link-ul din email, poți continua mai jos.</p>
							{resetUrl && (
								<div className='rounded-lg border border-gray-600 bg-gray-700/60 p-3 text-left'>
									<p className='text-xs uppercase tracking-wide text-gray-400'>Link de test</p>
									<a href={resetUrl} target='_blank' rel='noreferrer' className='mt-2 block break-all text-sm text-[#2B4EE6] hover:text-blue-400'>
										{resetUrl}
									</a>
								</div>
							)}
							<button
								type='button'
								onClick={() => setStep("reset")}
								className='w-full px-4 py-3 rounded-lg bg-[#2B4EE6] text-white font-medium hover:bg-blue-600 transition duration-200'
							>
								Completează parola nouă
							</button>
						</div>
					)}

					{step === "reset" && (
						<form onSubmit={handleResetPassword} className='space-y-6'>
							<div>
								<label htmlFor='token' className='block text-sm font-medium text-gray-400 mb-2'>Token de reset</label>
								<input
									id='token'
									type='text'
									required
									value={token}
									onChange={(e) => setToken(e.target.value)}
									className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent transition duration-200'
									placeholder='Introdu token-ul primit'
								/>
							</div>
							<div>
								<label htmlFor='newPassword' className='block text-sm font-medium text-gray-400 mb-2'>Parolă nouă</label>
								<input
									id='newPassword'
									type='password'
									required
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent transition duration-200'
									placeholder='Introdu o parolă nouă'
								/>
							</div>
							<div>
								<label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-400 mb-2'>Confirmă parola</label>
								<input
									id='confirmPassword'
									type='password'
									required
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent transition duration-200'
									placeholder='Confirmă parola nouă'
								/>
							</div>
							<button type='submit' disabled={loading} className='w-full flex items-center justify-center px-4 py-3 rounded-lg bg-[#2B4EE6] text-white font-medium hover:bg-blue-600 transition duration-200 disabled:opacity-50'>
								{loading ? <Loader className='animate-spin h-5 w-5' /> : "Schimbă parola"}
							</button>
						</form>
					)}

					{step === "done" && (
						<div className='text-center space-y-4'>
							<p className='text-green-400'>Parola a fost schimbată cu succes.</p>
							<Link to='/login' className='inline-flex items-center text-[#2B4EE6] hover:text-blue-400'>
								<ArrowLeft className='mr-2 h-4 w-4' />
								Înapoi la autentificare
							</Link>
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
