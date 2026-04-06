import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import CheckoutForm from './CheckoutForm';
import { FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
    const { items, totalPrice, promoCode, promoDiscount, newTotal } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && items.length > 0) {
            const getPaymentIntent = async () => {
                try {
                    const response = await axiosInstance.post('/orders/create-payment-intent/', {
                        promo_id: promoCode?.id || null
                    });
                    setClientSecret(response.data.clientSecret);
                } catch (error) {
                    console.error('Error fetching payment intent:', error);
                } finally {
                    setLoading(false);
                }
            };
            getPaymentIntent();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, items, promoCode]);

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (items.length === 0) return <Navigate to="/cart" />;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const safeNum = (val) => Number(val) || 0;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <Link to="/cart" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 font-bold transition-colors mb-4 group w-fit">
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Cart
                    </Link>
                    <h1 className="text-4xl font-black text-gray-900 italic uppercase">Secure Checkout</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Form Section */}
                    <div className="flex-1">
                        {clientSecret && (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <CheckoutForm clientSecret={clientSecret} promoId={promoCode?.id} />
                            </Elements>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FiShoppingBag className="text-primary-600" />
                                Review Order
                            </h2>
                            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                            <img src={item.product?.primary_image || item.product?.images?.[0]?.image} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 truncate">{item.product.name}</h4>
                                            <p className="text-xs text-gray-400 font-medium">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-black text-gray-900">{formatPrice(safeNum(item.product.current_price) * safeNum(item.quantity))}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-6 space-y-3">
                                <div className="flex justify-between text-gray-500 font-medium text-sm">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium text-sm">
                                    <span>Shipping</span>
                                    <span className="text-green-500 font-bold uppercase text-xs tracking-widest">Free</span>
                                </div>
                                {safeNum(promoDiscount) > 0 && (
                                    <div className="flex justify-between text-indigo-400 font-medium text-sm">
                                        <span>Promo ({promoCode?.code})</span>
                                        <span>-{formatPrice(promoDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-4">
                                    <span className="text-gray-900 font-black uppercase text-xs tracking-widest">Grand Total</span>
                                    <span className="text-3xl font-black text-gray-900">{formatPrice(safeNum(newTotal) || safeNum(totalPrice))}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
