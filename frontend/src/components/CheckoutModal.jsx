import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '../stores/useCartStore';
import { useUserStore } from '../stores/useUserStore';
import { Truck, Store, CreditCard, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { loadStripe } from "@stripe/stripe-js";
import axios from '../lib/axios';

const stripePromise = loadStripe(
	"pk_test_51RRX4nRqG6J0ltnNnb7z43YF1w3QxkCgs1IyQThg31wXDZgTevtlHNmurVuhet6awNb2QFrqntptC271iVCApama00AzTtMut1"
);

const CheckoutModal = ({ isOpen, onClose }) => {
    const { cart, total, subtotal, coupon, isCouponApplied, clearCart } = useCartStore();
    const { user } = useUserStore();
    const [step, setStep] = useState(1);
    const [deliveryMethod, setDeliveryMethod] = useState('courier');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [useProfileAddress, setUseProfileAddress] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [billingDetails, setBillingDetails] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        postalCode: '',
        company: '',
        cui: '',
        regCom: '',
    });

    useEffect(() => {
        if (user) {
            setBillingDetails(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
            }));

            if (user.addresses && user.addresses.length > 0) {
                const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
                if (defaultAddress) {
                    setBillingDetails(prev => ({
                        ...prev,
                        address: defaultAddress.street || '',
                        city: defaultAddress.city || '',
                        postalCode: defaultAddress.postalCode || '',
                    }));
                    setSelectedAddressId(defaultAddress._id);
                    setUseProfileAddress(true);
                }
            }
        }
    }, [user]);

    const handleUseProfileAddressChange = (e) => {
        const checked = e.target.checked;
        setUseProfileAddress(checked);
        if (checked && user?.addresses && user.addresses.length > 0) {
            const addressToUse = user.addresses.find(addr => addr._id === selectedAddressId) || user.addresses.find(addr => addr.isDefault) || user.addresses[0];
            if (addressToUse) {
                setBillingDetails(prev => ({
                    ...prev,
                    address: addressToUse.street || '',
                    city: addressToUse.city || '',
                    postalCode: addressToUse.postalCode || '',
                    phone: user?.phone || prev.phone, // Also set phone if using profile address
                }));
                setSelectedAddressId(addressToUse._id);
            }
        } else {
            // Clear address and phone fields if user unchecks and they were pre-filled from profile
            setBillingDetails(prev => ({
                ...prev,
                address: '',
                city: '',
                postalCode: '',
                phone: '', // Clear phone if not using profile
            }));
            setSelectedAddressId(null);
        }
    };

    const handleAddressSelect = (e) => {
        const id = e.target.value;
        setSelectedAddressId(id);
        const addressToUse = user.addresses.find(addr => addr._id === id);
        if (addressToUse) {
            setBillingDetails(prev => ({
                ...prev,
                address: addressToUse.street || '',
                city: addressToUse.city || '',
                postalCode: addressToUse.postalCode || '',
                phone: user?.phone || prev.phone, // Keep phone from profile even if changing address
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBillingDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (paymentMethod === 'card') {
            await handleStripePayment();
        } else {
            await handleCashOnDelivery();
        }
    };

    const handleStripePayment = async () => {
        try {
            setIsProcessing(true);
            
            // Validare câmpuri obligatorii
            if (!billingDetails.firstName || !billingDetails.lastName || !billingDetails.email || !billingDetails.phone) {
                toast.error('Te rugăm să completezi toate câmpurile obligatorii');
                return;
            }

            if (deliveryMethod === 'courier' && (!billingDetails.address || !billingDetails.city || !billingDetails.postalCode)) {
                toast.error('Te rugăm să completezi toate câmpurile de adresă pentru livrarea prin curier');
                return;
            }

            // Prepare products for Stripe
            const products = cart.map(item => ({
                _id: item._id,
                name: item.name,
                price: Number(item.price),
                quantity: item.quantity,
                image: item.image
            }));

            // Create checkout session
            const response = await axios.post('/payments/create-checkout-session', {
                products,
                couponCode: isCouponApplied ? coupon?.code : null
            });

            if (response.data.id) {
                // Redirect to Stripe Checkout
                const stripe = await stripePromise;
                const { error } = await stripe.redirectToCheckout({
                    sessionId: response.data.id
                });

                if (error) {
                    console.error('Stripe error:', error);
                    toast.error('Plata a eșuat. Încearcă din nou.');
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || 'Plata a eșuat. Încearcă din nou.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCashOnDelivery = async () => {
        try {
            setIsProcessing(true);
            
            // Validare câmpuri obligatorii
            if (!billingDetails.firstName || !billingDetails.lastName || !billingDetails.email || !billingDetails.phone) {
                toast.error('Te rugăm să completezi toate câmpurile obligatorii');
                return;
            }

            if (deliveryMethod === 'courier' && (!billingDetails.address || !billingDetails.city || !billingDetails.postalCode)) {
                toast.error('Te rugăm să completezi toate câmpurile de adresă pentru livrarea prin curier');
                return;
            }

            // Prepare order items for backend
            const orderItems = cart.map(item => ({
                product: item._id,
                quantity: item.quantity,
                price: item.price
            }));

            // Prepare shipping address
            const shippingAddress = {
                street: billingDetails.address,
                city: billingDetails.city,
                postalCode: billingDetails.postalCode,
                country: 'Romania'
            };

            // Create order for cash on delivery
            const orderData = {
                orderItems,
                shippingAddress,
                paymentMethod: 'cash',
                totalPrice: total
            };

            const response = await axios.post('/orders', orderData);
            
            if (response.data) {
                // Clear cart after successful order placement
                await clearCart();
                toast.success('Comanda a fost plasată cu succes! Vei plăti la livrare. Coșul tău a fost golit.');
                onClose();
            }
        } catch (error) {
            console.error('Order error:', error);
            toast.error(error.response?.data?.message || 'Nu s-a putut plasa comanda. Încearcă din nou.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-[#2B4EE6]">Finalizare comandă</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-between mb-8">
                        {["Livrare", "Date facturare", "Plată"].map((label, index) => (
                            <div
                                key={label}
                                className={`flex items-center ${
                                    index + 1 === step ? 'text-[#2B4EE6]' : 'text-gray-400'
                                }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                        index + 1 === step
                                            ? 'border-[#2B4EE6] bg-[#2B4EE6] text-white'
                                            : 'border-gray-400'
                                    }`}
                                >
                                    {index + 1}
                                </div>
                                <span className="ml-2">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Delivery Method */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Alege metoda de livrare</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setDeliveryMethod('courier')}
                                    className={`p-4 rounded-lg border-2 flex items-center space-x-4 ${
                                        deliveryMethod === 'courier'
                                            ? 'border-[#2B4EE6] bg-[#2B4EE6]/10'
                                            : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                >
                                    <Truck className="w-6 h-6 text-[#2B4EE6]" />
                                    <div className="text-left">
                                        <h4 className="font-medium text-white">Livrare prin curier</h4>
                                        <p className="text-sm text-gray-400">Livrare rapidă la adresa ta</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setDeliveryMethod('pickup')}
                                    className={`p-4 rounded-lg border-2 flex items-center space-x-4 ${
                                        deliveryMethod === 'pickup'
                                            ? 'border-[#2B4EE6] bg-[#2B4EE6]/10'
                                            : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                >
                                    <Store className="w-6 h-6 text-[#2B4EE6]" />
                                    <div className="text-left">
                                        <h4 className="font-medium text-white">Ridicare din magazin</h4>
                                        <p className="text-sm text-gray-400">Ridică de la magazinul nostru</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Billing Details */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Date facturare</h3>
                            {user?.addresses && user.addresses.length > 0 && (
                                <div className="mb-4">
                                    <label className="flex items-center text-gray-400">
                                        <input
                                            type="checkbox"
                                            checked={useProfileAddress}
                                            onChange={handleUseProfileAddressChange}
                                            className="h-4 w-4 text-[#2B4EE6] bg-gray-800 border-gray-600 rounded focus:ring-[#2B4EE6]"
                                        />
                                        <span className="ml-2">Folosește adresa din profilul meu</span>
                                    </label>
                                    {useProfileAddress && (
                                        <div className="mt-2">
                                            <select
                                                value={selectedAddressId || ''}
                                                onChange={handleAddressSelect}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                                            >
                                                {user.addresses.map(addr => (
                                                    <option key={addr._id} value={addr._id}>
                                                        {addr.title} - {addr.street}, {addr.city}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Nume</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={billingDetails.firstName}
                                        onChange={handleInputChange}
                                        readOnly={useProfileAddress}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Prenume</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={billingDetails.lastName}
                                        onChange={handleInputChange}
                                        readOnly={useProfileAddress}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={billingDetails.email}
                                        onChange={handleInputChange}
                                        readOnly={useProfileAddress}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Telefon</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={billingDetails.phone}
                                        onChange={handleInputChange}
                                        readOnly={useProfileAddress}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                {deliveryMethod === 'courier' && (
                                    <>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Adresă</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={billingDetails.address}
                                                onChange={handleInputChange}
                                                readOnly={useProfileAddress}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Oraș</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={billingDetails.city}
                                                onChange={handleInputChange}
                                                readOnly={useProfileAddress}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Cod poștal</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={billingDetails.postalCode}
                                                onChange={handleInputChange}
                                                readOnly={useProfileAddress}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Companie (opțional)</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={billingDetails.company}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">CUI (opțional)</label>
                                    <input
                                        type="text"
                                        name="cui"
                                        value={billingDetails.cui}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Reg. Com. (opțional)</label>
                                    <input
                                        type="text"
                                        name="regCom"
                                        value={billingDetails.regCom}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Payment Method */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Alege metoda de plată</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-4 rounded-lg border-2 flex items-center space-x-4 ${
                                        paymentMethod === 'card'
                                            ? 'border-[#2B4EE6] bg-[#2B4EE6]/10'
                                            : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                >
                                    <CreditCard className="w-6 h-6 text-[#2B4EE6]" />
                                    <div className="text-left">
                                        <h4 className="font-medium text-white">Card de credit/debit</h4>
                                        <p className="text-sm text-gray-400">Plătește cu cardul</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`p-4 rounded-lg border-2 flex items-center space-x-4 ${
                                        paymentMethod === 'cash'
                                            ? 'border-[#2B4EE6] bg-[#2B4EE6]/10'
                                            : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                >
                                    <Wallet className="w-6 h-6 text-[#2B4EE6]" />
                                    <div className="text-left">
                                        <h4 className="font-medium text-white">Plată la livrare</h4>
                                        <p className="text-sm text-gray-400">Plătești când primești coletul</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-6 py-2 border border-gray-600 rounded-lg text-white hover:bg-gray-700"
                                disabled={isProcessing}
                            >
                                Înapoi
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="px-6 py-2 bg-[#2B4EE6] rounded-lg text-white hover:bg-blue-600 disabled:opacity-50"
                                disabled={isProcessing}
                            >
                                Continuă
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-[#2B4EE6] rounded-lg text-white hover:bg-blue-600 disabled:opacity-50"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Se procesează...' : paymentMethod === 'card' ? 'Plătește cu cardul' : 'Plasează comanda'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CheckoutModal; 