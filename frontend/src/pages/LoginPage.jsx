import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, Loader } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);

	const { login, loading } = useUserStore();

	const handleSubmit = (e) => {
		e.preventDefault();
		login(email, password);
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full'>
				<motion.div
					className='bg-gray-800 rounded-lg shadow-xl p-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<div className='text-center mb-8'>
						<h2 className='text-3xl font-bold text-white mb-2'>Autentifică-te</h2>
						<p className='text-sm text-gray-400'>
							Sau{' '}
							<Link to='/signup' className='text-[#2B4EE6] hover:text-blue-400 font-medium'>
								creează un cont nou
							</Link>
						</p>
					</div>
				
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<label htmlFor='email' className='block text-sm font-medium text-gray-400 mb-2'>
								Adresă de email
							</label>
							<input
								id='email'
								type='email'
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent transition duration-200'
								placeholder='Introdu adresa de email'
							/>
						</div>

						<div>
							<label htmlFor='password' className='block text-sm font-medium text-gray-400 mb-2'>
								Parolă
							</label>
							<input
								id='password'
								type='password'
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-transparent transition duration-200'
								placeholder='Introdu parola'
							/>
						</div>

						<div className='flex items-center justify-between'>
							<div className='flex items-center'>
								<input
									id='remember-me'
									type='checkbox'
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
									className='h-4 w-4 rounded border-gray-600 bg-gray-700 text-[#2B4EE6] focus:ring-[#2B4EE6] focus:ring-offset-gray-800'
								/>
								<label htmlFor='remember-me' className='ml-2 block text-sm text-gray-400'>
									Ține-mă minte
								</label>
							</div>
							<Link to='/forgot-password' className='text-sm text-[#2B4EE6] hover:text-blue-400'>
								Ai uitat parola?
							</Link>
						</div>

						<button
							type='submit'
							disabled={loading}
							className='w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#2B4EE6] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B4EE6] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading ? (
								<>
									<Loader className='animate-spin -ml-1 mr-2 h-5 w-5' />
									Se autentifică...
								</>
							) : (
								<>
									<LogIn className='-ml-1 mr-2 h-5 w-5' />
									Autentificare
								</>
							)}
						</button>
					</form>
				</motion.div>
			</div>
		</div>
	);
};

export default LoginPage;
