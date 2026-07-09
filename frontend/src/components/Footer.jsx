import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useEffect } from "react";
import { useCategoryStore } from "../stores/useCategoryStore";

const Footer = () => {
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <footer className="bg-[#0B0F17] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* AutoParts Column */}
          <div>
            <h3 className="mb-4">
              <span className="text-[#FF3B30] text-xl font-bold">Auto</span>
              <span className="text-[#367BF5] text-xl font-bold">Piese</span>
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Sursa ta de încredere pentru piese auto de calitate și service profesional.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-white font-medium mb-4">Link-uri rapide</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-gray-300 transition-colors">
                  Acasă
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-gray-300 transition-colors">
                  Produse
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-gray-300 transition-colors">
                  Servicii
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-gray-400 hover:text-gray-300 transition-colors">
                  Testimoniale
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-gray-300 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories Column */}
          <div>
            <h3 className="text-white font-medium mb-4">Categorii produse</h3>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <li key={category._id}>
                  <Link 
                    to={`/category/${category.slug}`} 
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  to="/categories" 
                  className="text-[#2B4EE6] hover:text-blue-400 transition-colors"
                >
                  Vezi toate categoriile →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information Column */}
          <div>
            <h3 className="text-white font-medium mb-4">Informații de contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Str. Auto Center nr. 123</li>
              <li>Orasul Meu, JU 12345</li>
              <li>Telefon: 0740 123 456</li>
              <li>Email: info@autopiese.ro</li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-[#1A1F2B]">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © 2025 AutoPiese. Toate drepturile rezervate.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">
                Politica de confidențialitate
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">
                Termeni și condiții
              </Link>
              <Link to="/shipping" className="text-gray-500 hover:text-gray-300 transition-colors">
                Politica de livrare
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 