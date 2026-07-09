import { useState, useEffect } from "react";
import {
	ShoppingCart,
	LogIn,
	LogOut,
	Lock,
	Search,
	User,
	Menu,
	X,
	Home,
	Grid,
	UserPlus,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
	const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";
	const { cart } = useCartStore();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const location = useLocation();

	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isMobileMenuOpen]);

	const handleLogout = async () => {
		setIsMobileMenuOpen(false);
		await logout();
	};

	const mobileNavLinkClass =
		"flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors";

	return (
		<header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-[#2B4EE6]'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex justify-between items-center gap-3'>
					<Link to='/' className='flex items-center gap-2 min-w-0 shrink'>
						<div className='flex items-center justify-center h-8 shrink-0'>
							<span className='text-3xl translate-y-[1px]'>🏎</span>
						</div>
						<span className='text-lg sm:text-2xl font-bold text-[#2B4EE6] truncate'>
							<span className='sm:hidden'>Midnight</span>
							<span className='hidden sm:inline'>Midnight Racers</span>
						</span>
					</Link>

					{/* Desktop */}
					<div className='hidden md:flex items-center gap-4'>
						<div className='relative flex items-center'>
							<input
								type="text"
								placeholder="Caută piese..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='w-64 px-4 py-2 pl-10 bg-gray-800 text-gray-300 rounded-full border border-gray-700 focus:outline-none focus:border-[#2B4EE6]'
							/>
							<Search className='absolute left-3 text-gray-400' size={18} />
						</div>

						<nav className='flex items-center gap-4'>
							{user && (
								<>
									<Link
										to="/cart"
										className='relative group text-gray-300 hover:text-[#2B4EE6] transition duration-300'
									>
										<ShoppingCart className='inline-block group-hover:text-[#2B4EE6]' size={24} />
										{cart.length > 0 && (
											<span className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs min-w-[20px] text-center'>
												{cart.length}
											</span>
										)}
									</Link>
									<Link
										to="/profile"
										className='text-gray-300 hover:text-[#2B4EE6] transition duration-300'
									>
										<User size={24} />
									</Link>
								</>
							)}

							{user ? (
								<button
									onClick={handleLogout}
									className='text-gray-300 hover:text-[#2B4EE6] transition duration-300'
									aria-label="Deconectare"
								>
									<LogOut size={24} />
								</button>
							) : (
								<Link
									to="/login"
									className='text-gray-300 hover:text-[#2B4EE6] transition duration-300'
								>
									<LogIn size={24} />
								</Link>
							)}

							{isAdmin && (
								<Link
									to="/secret-dashboard"
									className='text-gray-300 hover:text-[#2B4EE6] transition duration-300'
								>
									<Lock size={24} />
								</Link>
							)}
						</nav>
					</div>

					{/* Mobile menu toggle */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className='md:hidden p-2 text-gray-300 hover:text-white transition duration-300'
						aria-label={isMobileMenuOpen ? "Închide meniul" : "Deschide meniul"}
						aria-expanded={isMobileMenuOpen}
					>
						{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			{isMobileMenuOpen && (
				<>
					<div
						className='fixed inset-0 top-[57px] bg-black/50 md:hidden z-30'
						onClick={() => setIsMobileMenuOpen(false)}
						aria-hidden="true"
					/>
					<nav className='md:hidden absolute left-0 right-0 top-full bg-gray-900 border-b border-gray-700 shadow-xl z-40 max-h-[calc(100vh-57px)] overflow-y-auto'>
						<div className='container mx-auto px-4 py-4 space-y-4'>
							<div className='relative'>
								<input
									type="text"
									placeholder="Caută piese..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='w-full px-4 py-3 pl-10 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-[#2B4EE6]'
								/>
								<Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
							</div>

							<div className='space-y-1'>
								<Link to="/" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
									<Home size={20} />
									Acasă
								</Link>
								<Link to="/categories" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
									<Grid size={20} />
									Categorii
								</Link>

								{user ? (
									<>
										<Link to="/cart" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
											<ShoppingCart size={20} />
											Coș
											{cart.length > 0 && (
												<span className='ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full'>
													{cart.length}
												</span>
											)}
										</Link>
										<Link to="/profile" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
											<User size={20} />
											Profilul meu
										</Link>
										{isAdmin && (
											<Link to="/secret-dashboard" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
												<Lock size={20} />
												Admin Dashboard
											</Link>
										)}
										<button
											onClick={handleLogout}
											className={`${mobileNavLinkClass} w-full text-left`}
										>
											<LogOut size={20} />
											Deconectare
										</button>
									</>
								) : (
									<>
										<Link to="/login" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
											<LogIn size={20} />
											Autentificare
										</Link>
										<Link to="/signup" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
											<UserPlus size={20} />
											Înregistrare
										</Link>
									</>
								)}
							</div>
						</div>
					</nav>
				</>
			)}
		</header>
	);
};

export default Navbar;
