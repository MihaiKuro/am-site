import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Loader, X } from "lucide-react";
import toast from "react-hot-toast";
import { useProductStore } from "../stores/useProductStore";
import { useCategoryStore } from "../stores/useCategoryStore";

const inputClass =
	"mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg shadow-sm py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] focus:border-[#2B4EE6] transition-colors duration-200";

const EditProductForm = ({ product, onClose }) => {
	const { updateProduct } = useProductStore();
	const { categories, fetchCategories } = useCategoryStore();

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const [formData, setFormData] = useState({
		name: product.name || "",
		description: product.description || "",
		price: product.price || "",
		basePrice: product.basePrice ?? "",
		category: product.category?._id || "",
		subcategory: product.subcategory?._id || "",
		image: product.image || "",
		stock: product.stock || "",
	});

	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === "price" || name === "stock" || name === "basePrice") {
			setFormData((prev) => ({
				...prev,
				[name]: value === "" ? "" : parseFloat(value),
			}));
		} else if (name === "category") {
			setFormData((prev) => ({
				...prev,
				category: value,
				subcategory: "",
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setFormData((prev) => ({
					...prev,
					image: reader.result,
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const selectedCategory = categories.find((cat) => cat._id === formData.category);

			if (
				selectedCategory &&
				selectedCategory.subcategories &&
				selectedCategory.subcategories.length > 0 &&
				!formData.subcategory
			) {
				throw new Error("Selectează o subcategorie");
			}

			await updateProduct(product._id, {
				...formData,
				category: formData.category,
				subcategory: formData.subcategory,
			});

			toast.success("Produs actualizat cu succes!");
			onClose();
		} catch (error) {
			toast.error(error.response?.data?.message || error.message || "Nu s-a putut actualiza produsul");
		} finally {
			setLoading(false);
		}
	};

	const selectedCategoryObject = categories.find((cat) => cat._id === formData.category);
	const subcategoriesForSelectedCategory = selectedCategoryObject?.subcategories || [];

	return (
		<motion.div
			className='flex flex-col w-full max-h-[100dvh] sm:max-h-[90vh] bg-gray-900 sm:bg-gray-800/95 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-t-2xl sm:rounded-2xl'
			initial={{ opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25 }}
		>
			<div className='flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-700 shrink-0'>
				<h2 className='text-lg sm:text-xl font-semibold text-[#2B4EE6] truncate'>Editează produsul</h2>
				<button
					type='button'
					onClick={onClose}
					className='p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors shrink-0'
					aria-label='Închide'
				>
					<X className='h-5 w-5' />
				</button>
			</div>

			<form onSubmit={handleSubmit} className='flex flex-col min-h-0 flex-1'>
				<div className='overflow-y-auto px-4 sm:px-6 py-4 space-y-4 sm:space-y-5'>
					<div>
						<label htmlFor='name' className='block text-sm font-medium text-gray-300'>
							Nume produs
						</label>
						<input
							type='text'
							id='name'
							name='name'
							value={formData.name}
							onChange={handleChange}
							className={inputClass}
							required
							autoComplete='product-name'
						/>
					</div>

					<div>
						<label htmlFor='description' className='block text-sm font-medium text-gray-300'>
							Descriere
						</label>
						<textarea
							id='description'
							name='description'
							value={formData.description}
							onChange={handleChange}
							rows={3}
							className={inputClass}
							required
							autoComplete='off'
						/>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div>
							<label htmlFor='price' className='block text-sm font-medium text-gray-300'>
								Preț (RON)
							</label>
							<input
								type='number'
								id='price'
								name='price'
								value={formData.price}
								onChange={handleChange}
								min='0'
								step='0.01'
								className={inputClass}
								required
								autoComplete='off'
							/>
						</div>

						<div>
							<label htmlFor='basePrice' className='block text-sm font-medium text-gray-300'>
								Preț de bază (Cost - RON)
							</label>
							<input
								type='number'
								id='basePrice'
								name='basePrice'
								value={formData.basePrice}
								onChange={handleChange}
								min='0'
								step='0.01'
								className={inputClass}
								autoComplete='off'
							/>
						</div>

						<div>
							<label htmlFor='stock' className='block text-sm font-medium text-gray-300'>
								Stoc
							</label>
							<input
								type='number'
								id='stock'
								name='stock'
								value={formData.stock}
								onChange={handleChange}
								min='0'
								className={inputClass}
								required
								autoComplete='off'
							/>
						</div>
					</div>

					<div>
						<label htmlFor='category' className='block text-sm font-medium text-gray-300'>
							Categorie
						</label>
						<select
							id='category'
							name='category'
							value={formData.category}
							onChange={handleChange}
							className={inputClass}
							required
							autoComplete='category'
						>
							<option value=''>Selectează categoria</option>
							{categories.map((category) => (
								<option key={category._id} value={category._id}>
									{category.name}
								</option>
							))}
						</select>
					</div>

					{formData.category && subcategoriesForSelectedCategory.length > 0 && (
						<div>
							<label htmlFor='subcategory' className='block text-sm font-medium text-gray-300'>
								Subcategorie
							</label>
							<select
								id='subcategory'
								name='subcategory'
								value={formData.subcategory}
								onChange={handleChange}
								className={inputClass}
								required
								autoComplete='off'
							>
								<option value=''>Selectează subcategoria</option>
								{subcategoriesForSelectedCategory.map((subcategory) => (
									<option key={subcategory._id} value={subcategory._id}>
										{subcategory.name}
									</option>
								))}
							</select>
						</div>
					)}

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>Imagine</label>
						<div className='flex flex-wrap items-center gap-3'>
							<input
								type='file'
								id='image'
								className='sr-only'
								onChange={handleImageChange}
								accept='image/*'
								autoComplete='off'
							/>
							<label
								htmlFor='image'
								className='cursor-pointer inline-flex items-center bg-gray-900/50 py-2.5 px-4 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] transition-colors duration-200'
							>
								<Upload className='h-5 w-5 mr-2 shrink-0' />
								{formData.image ? "Schimbă imaginea" : "Încarcă imagine"}
							</label>
							{formData.image && (
								<img
									src={formData.image}
									alt='Previzualizare produs'
									className='h-14 w-14 rounded-lg object-cover border border-gray-700'
								/>
							)}
						</div>
					</div>
				</div>

				<div className='flex flex-col-reverse sm:flex-row gap-3 px-4 sm:px-6 py-4 border-t border-gray-700 shrink-0 bg-gray-900/80 sm:bg-gray-800/95'>
					<motion.button
						type='button'
						onClick={onClose}
						className='w-full sm:flex-1 flex justify-center items-center py-2.5 px-4 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-700 transition-colors duration-200'
						whileTap={{ scale: 0.98 }}
					>
						Anulează
					</motion.button>
					<motion.button
						type='submit'
						className='w-full sm:flex-1 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-[#2B4EE6] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#2B4EE6] disabled:opacity-50 transition-colors duration-200'
						disabled={loading}
						whileTap={{ scale: 0.98 }}
					>
						{loading ? (
							<>
								<Loader className='mr-2 h-5 w-5 animate-spin' />
								Se salvează...
							</>
						) : (
							"Salvează produsul"
						)}
					</motion.button>
				</div>
			</form>
		</motion.div>
	);
};

export default EditProductForm;
