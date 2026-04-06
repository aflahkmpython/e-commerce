import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, clearCartLocal } from '../../features/cart/cartSlice';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiCheckCircle, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { formatPrice } from '../../utils/format';

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalPrice } = useSelector((state) => state.cart);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        full_name: '', address_line_1: '', city: '', state: '', postal_code: '', country: 'United States'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchCart());
        fetchAddresses();
    }, [dispatch]);

    const fetchAddresses = async () => {
        try {
            const response = await axiosInstance.get('orders/addresses/');
            setAddresses(response.data);
            if (response.data.length > 0) {
                const defaultAddr = response.data.find(a => a.is_default) || response.data[0];
                setSelectedAddress(defaultAddr.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('orders/addresses/', newAddress);
            setAddresses([...addresses, response.data]);
            setSelectedAddress(response.data.id);
            setShowAddressForm(false);
        } catch (err) {
            alert('Failed to add address');
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Please select a shipping address');
            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.post('orders/orders/', {
                shipping_address: selectedAddress
            });
            dispatch(clearCartLocal());
            navigate(`/order-success/${response.data.id}`);
        } catch (err) {
            alert(err.response?.data?.error || 'Order failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={() => navigate('/cart')} className="flex items-center text-sm font-bold text-gray-500 hover:text-primary-600 mb-8">
                <FiArrowLeft className="mr-2" /> Back to Cart
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <FiMapPin className="text-primary-600" /> Shipping Address
                            </h2>
                            {!showAddressForm && (
                                <button 
                                    onClick={() => setShowAddressForm(true)}
                                    className="text-primary-600 font-bold text-sm flex items-center gap-1 hover:underline"
                                >
                                    <FiPlus /> Add New
                                </button>
                            )}
                        </div>

                        {showAddressForm ? (
                            <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="p-3 border border-gray-200 rounded-xl" placeholder="Full Name" required value={newAddress.full_name} onChange={e => setNewAddress({...newAddress, full_name: e.target.value})} />
                                <input className="p-3 border border-gray-200 rounded-xl" placeholder="Address Line 1" required value={newAddress.address_line_1} onChange={e => setNewAddress({...newAddress, address_line_1: e.target.value})} />
                                <input className="p-3 border border-gray-200 rounded-xl" placeholder="City" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                                <input className="p-3 border border-gray-200 rounded-xl" placeholder="State" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                                <input className="p-3 border border-gray-200 rounded-xl" placeholder="Postal Code" required value={newAddress.postal_code} onChange={e => setNewAddress({...newAddress, postal_code: e.target.value})} />
                                <div className="flex gap-2 col-span-full">
                                    <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold">Save Address</button>
                                    <button type="button" onClick={() => setShowAddressForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl font-bold">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                {addresses.map(addr => (
                                    <div 
                                        key={addr.id}
                                        onClick={() => setSelectedAddress(addr.id)}
                                        className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-primary-600 bg-primary-50/30' : 'border-gray-100 hover:border-primary-200'}`}
                                    >
                                        <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                                            <span>{addr.full_name}</span>
                                            {selectedAddress === addr.id && <FiCheckCircle className="text-primary-600 text-xl" />}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{addr.address_line_1}, {addr.city}, {addr.state} {addr.postal_code}</p>
                                    </div>
                                ))}
                                {addresses.length === 0 && <p className="text-gray-400 italic">No addresses saved. Please add one.</p>}
                            </div>
                        )}
                    </section>

                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <FiCreditCard className="text-primary-600" /> Payment Method
                        </h2>
                        <div className="p-6 border-2 border-primary-600 bg-primary-50/30 rounded-2xl flex items-center gap-4">
                            <div className="bg-white p-3 rounded-xl shadow-sm italic font-black text-primary-600 text-xl">Pay on Delivery</div>
                            <div>
                                <h4 className="font-bold text-gray-900">Cash/Card on Delivery</h4>
                                <p className="text-sm text-gray-500">Pay when you receive your items.</p>
                            </div>
                            <FiCheckCircle className="ml-auto text-primary-600 text-xl" />
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white sticky top-24 shadow-2xl">
                        <h2 className="text-2xl font-black mb-8 border-b border-gray-800 pb-4">Checkout Summary</h2>
                        <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-center gap-4">
                                    <span className="text-sm text-gray-400 truncate">{item.quantity} x {item.product.name}</span>
                                    <span className="font-bold text-sm">{formatPrice(item.product.current_price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-end mb-10 pt-6 border-t border-gray-800">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total to Pay</span>
                            <span className="text-4xl font-black text-white leading-none">{formatPrice(totalPrice)}</span>
                        </div>
                        <button 
                            onClick={handlePlaceOrder}
                            disabled={loading || items.length === 0}
                            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'PROCESSING...' : 'PLACE ORDER NOW'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
