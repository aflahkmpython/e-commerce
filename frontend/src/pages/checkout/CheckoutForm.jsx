import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { createOrder } from '../../features/orders/orderSlice';
import { fetchCart } from '../../features/cart/cartSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import { formatPrice } from '../../utils/format';

const CheckoutForm = ({ clientSecret, promoId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { totalPrice, newTotal } = useSelector((state) => state.cart);
    const orderTotalCharge = newTotal || totalPrice;
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [shippingDetails, setShippingDetails] = useState({
        full_name: '',
        address_line_1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'United States'
    });

    const handleInputChange = (e) => {
        setShippingDetails({
            ...shippingDetails,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        try {
            // 1. Confirm Payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: shippingDetails.full_name,
                    },
                },
            });

            if (stripeError) {
                setError(stripeError.message);
                toast.error(stripeError.message);
                setIsProcessing(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // 2. Create Order in Backend
                const orderData = {
                    shipping_address: shippingDetails,
                    payment_id: paymentIntent.id,
                    total_amount: orderTotalCharge,
                    promo_id: promoId
                };

                const resultAction = await dispatch(createOrder(orderData));
                
                if (createOrder.fulfilled.match(resultAction)) {
                    toast.success('Order placed successfully!');
                    dispatch(fetchCart()); // Refresh cart (should be empty now)
                    navigate('/order-success');
                } else {
                    setError('Payment succeeded but failed to create order. Please contact support.');
                    toast.error('Order creation failed.');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            toast.error('Payment failed.');
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            name="full_name" 
                            required 
                            value={shippingDetails.full_name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                        <input 
                            type="text" 
                            name="address_line_1" 
                            required 
                            value={shippingDetails.address_line_1}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                            placeholder="123 Street Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                        <input 
                            type="text" 
                            name="city" 
                            required 
                            value={shippingDetails.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">State / Province</label>
                        <input 
                            type="text" 
                            name="state" 
                            required 
                            value={shippingDetails.state}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Postal Code</label>
                        <input 
                            type="text" 
                            name="postal_code" 
                            required 
                            value={shippingDetails.postal_code}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Country</label>
                        <select 
                            name="country" 
                            value={shippingDetails.country}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 transition-all outline-none bg-white"
                        >
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Australia">Australia</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
                    <div className="flex gap-2">
                        <FiLock className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Secure SSL</span>
                    </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                    <CardElement options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#111827',
                                '::placeholder': { color: '#9CA3AF' },
                            },
                        },
                    }} />
                </div>

                {error && <p className="text-red-500 text-sm font-bold mb-6">{error}</p>}

                <button 
                    disabled={isProcessing || !stripe}
                    className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-gray-300 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                    {isProcessing ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>PAY {formatPrice(orderTotalCharge)} <FiCheckCircle className="text-xl" /></>
                    )}
                </button>
            </div>
        </form>
    );
};

export default CheckoutForm;
