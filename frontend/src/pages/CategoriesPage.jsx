import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useCategoryStore } from "../stores/useCategoryStore";

const CategoriesPage = () => {
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className='min-h-screen text-white py-12 bg-[#0B0F17]'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h1 className='text-4xl font-bold text-[#2B4EE6] mb-4'>All Categories</h1>
        <p className='text-gray-400 mb-8 text-lg'>Browse our extensive collection of auto parts organized by category</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {categories.map((category) => (
            <CategoryItem 
              key={category._id} 
              category={{
                href: `/category/${category.slug}`,
                name: category.name,
                imageUrl: category.image
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage; 