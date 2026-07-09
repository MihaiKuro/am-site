import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { useProductStore } from "../stores/useProductStore";
import { useCategoryStore } from "../stores/useCategoryStore";

const CreateProductForm = () => {
	const { createProduct } = useProductStore();
	const { categories, fetchCategories } = useCategoryStore();

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		category: "",
		subcategory: "",
		image: "",
		stock: "",
		basePrice: "",
	});

	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === 'price' || name === 'stock' || name === 'basePrice') {
			setFormData((prev) => ({
				...prev,
				[name]: parseFloat(value),
			}));
		} else if (name === 'category') {
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
			const selectedCategory = categories.find(cat => cat._id === formData.category);

			if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && !formData.subcategory) {
				throw new Error("Please select a subcategory");
			}

			await createProduct({
				...formData,
				category: formData.category,
				subcategory: formData.subcategory,
			});

			setFormData({
				name: "",
				description: "",
				price: "",
				category: "",
				subcategory: "",
				image: "",
				stock: "",
				basePrice: "",
			});
			toast.success("Product created successfully!");
		} catch (error) {
			toast.error(error.response?.data?.message || error.message || "Failed to create product");
		} finally {
			setLoading(false);
		}
	};

	const selectedCategoryObject = categories.find(cat => cat._id === formData.category);
	const subcategoriesForSelectedCategory = selectedCategoryObject?.subcategories || [];

	return (
		<div className='max-w-2xl mx-auto'>
			<motion.div
				className='bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg p-4 sm:p-6'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h2 className='text-2xl font-semibold mb-6 text-[#2B4EE6]'>Adaugă produs nou</h2>

				<form onSubmit={handleSubmit} className='space-y-6'>
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
							className='mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg shadow-sm py-2.5
							px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2
							focus:ring-[#2B4EE6] focus:border-[#2B4EE6] transition-colors duration-200'
							required
							autoComplete="product-name"
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
							rows={4}
							className='mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg shadow-sm py-2.5
							px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2
							focus:ring-[#2B4EE6] focus:border-[#2B4EE6] transition-colors duration-200'
							required
							autoComplete="off"
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
								className='mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg shadow-sm py-2.5
								px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2
								focus:ring-[#2B4EE6] focus:border-[#2B4EE6] transition-colors duration-200'
								required
								autoComplete="off"
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
								className='mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg shadow-sm py-2.5
								px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2
								focus:ring-[#2B4EE6] focus:border-[#2B4EE6] transition-colors duration-200'
								autoComplete="off"
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
								className='mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg shadow-sm py-2.5
								px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2
								focus:ring-[#2B4EE6] focus:border-[#2B4EE6] transition-colors duration-200'
								required
								autoComplete="off"
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
							className='mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg shadow-sm py-2.5
							px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2
							focus:ring-[#2B4EE6] focus:border-[#2B4EE6] transition-colors duration-200'
							required
							autoComplete="category"
						>
							<option value=''>Selectează o categorie</option>
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
								Subcategory
							</label>
							<select
								id='subcategory'
								name='subcategory'
								value={formData.subcategory}
								onChange={handleChange}
								className='mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg shadow-sm py-2.5
								px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2
								focus:ring-[#2B4EE6] focus:border-[#2B4EE6] transition-colors duration-200'
								required
								autoComplete="off"
							>
								<option value=''>Select a subcategory</option>
								{subcategoriesForSelectedCategory.map((subcategory) => (
									<option key={subcategory._id} value={subcategory._id}>
										{subcategory.name}
									</option>
								))}
							</select>
						</div>
					)}

					<div>
						<div className='mt-1 flex items-center'>
							<input
								type='file'
								id='image'
								className='sr-only'
								onChange={handleImageChange}
								accept='image/*'
								autoComplete="off"
							/>
							<label
								htmlFor='image'
								className='cursor-pointer bg-gray-900/50 py-2.5 px-4 border border-gray-700 rounded-lg 
								shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-800/50 focus:outline-none 
								focus:ring-2 focus:ring-[#2B4EE6] focus:border-[#2B4EE6] transition-colors duration-200'
							>
								<Upload className='h-5 w-5 inline-block mr-2' />
								Upload Image
							</label>
							{formData.image && (
								<span className='ml-3 text-sm text-gray-400 flex items-center'>
									<div className='w-2 h-2 bg-[#2B4EE6] rounded-full mr-2'></div>
									Image uploaded
								</span>
							)}
						</div>
					</div>

					<motion.button
						type='submit'
						className='w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg 
						shadow-lg text-sm font-medium text-white bg-[#2B4EE6] hover:bg-blue-600 
						focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B4EE6] disabled:opacity-50
						transition-colors duration-200'
						disabled={loading}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						{loading ? (
							<>
								<Loader className='mr-2 h-5 w-5 animate-spin' />
								Creating...
							</>
						) : (
							"Create Product"
						)}
					</motion.button>
				</form>
			</motion.div>
		</div>
	);
};

export default CreateProductForm;
