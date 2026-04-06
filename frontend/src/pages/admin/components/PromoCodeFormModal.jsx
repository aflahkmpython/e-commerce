import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiXCircle } from 'react-icons/fi';
import axiosInstance from "../../../utils/axiosInstance";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const PromoCodeFormModal = ({ promo, onClose, onSave }) => {
    const isEditing = !!promo;

    // Form state
    const [code, setCode] = useState(promo?.code || '');
    const [discountType, setDiscountType] = useState(promo?.discount_type || 'percentage');
    const [discountValue, setDiscountValue] = useState(promo?.discount_value || '');
    const [minOrderValue, setMinOrderValue] = useState(promo?.min_order_value || '0');
    const [hasLimit, setHasLimit] = useState(promo?.usage_limit !== null && promo?.usage_limit !== undefined);
    const [usageLimit, setUsageLimit] = useState(promo?.usage_limit || '');
    const [validFrom, setValidFrom] = useState(promo?.valid_from ? new Date(promo.valid_from) : new Date());
    const [expiryDate, setExpiryDate] = useState(promo?.expiry_date ? new Date(promo.expiry_date) : new Date(new Date().setMonth(new Date().getMonth() + 1)));

    // Availability state
    const [isAvailable, setIsAvailable] = useState(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        if (isEditing) return; // don't check availability while editing since it's already theirs

        if (!code) {
            setIsAvailable(null);
            return;
        }

        const debounceItem = setTimeout(async () => {
            setChecking(true);
            try {
                const response = await axiosInstance.get(`/admin/promos/check-code/?code=${code}`);
                setIsAvailable(response.data.available);
            } catch {
                setIsAvailable(null);
            }
            setChecking(false);
        }, 500);

        return () => clearTimeout(debounceItem);
    }, [code, isEditing]);

    const handleCodeChange = (e) => {
        const val = e.target.value.toUpperCase();
        setCode(val);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation check
        if (!isEditing && isAvailable === false) return; // Don't allow submit if taken

        const data = {
            code,
            discount_type: discountType,
            discount_value: parseFloat(discountValue),
            min_order_value: parseFloat(minOrderValue),
            usage_limit: hasLimit ? parseInt(usageLimit) : null,
            valid_from: validFrom.toISOString(),
            expiry_date: expiryDate.toISOString(),
        };

        onSave(data);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xl overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-gray-50 text-gray-400 rounded-full hover:text-black transition-all">
                    <FiX size={20} />
                </button>

                <h2 className="text-2xl font-black text-gray-900 italic uppercase mb-8">
                    {isEditing ? 'Modify Promo Code' : 'Generate Promo Code'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Code Input */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Promotion Code</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={handleCodeChange}
                                disabled={isEditing}
                                className="w-full h-14 bg-gray-50 border-none rounded-2xl pl-5 pr-14 font-black text-lg italic text-gray-900 focus:ring-4 focus:ring-indigo-100 uppercase transition-all"
                                placeholder="E.G. SUMMER50"
                            />
                            {!isEditing && code && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {checking ? (
                                        <div className="w-5 h-5 border-2 border-t-indigo-500 border-indigo-200 rounded-full animate-spin" />
                                    ) : isAvailable ? (
                                        <FiCheck className="text-green-500" size={20} />
                                    ) : (
                                        <FiXCircle className="text-red-500" size={20} />
                                    )}
                                </div>
                            )}
                        </div>
                        {!isEditing && isAvailable === false && <p className="text-red-500 text-xs italic font-bold">This code is already in use.</p>}
                    </div>

                    {/* Discount Details */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 flex flex-col">
                            <label className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Type</label>
                            <div className="flex bg-gray-50 rounded-2xl p-1 mt-auto">
                                <button type="button" onClick={() => setDiscountType('percentage')} className={`flex-1 h-12 rounded-xl text-xs font-black uppercase italic transition-all ${discountType === 'percentage' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>% Off</button>
                                <button type="button" onClick={() => setDiscountType('flat')} className={`flex-1 h-12 rounded-xl text-xs font-black uppercase italic transition-all ${discountType === 'flat' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>Flat \u20b9</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Discount Value</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max={discountType === 'percentage' ? "100" : undefined}
                                value={discountValue}
                                onChange={e => setDiscountValue(e.target.value)}
                                className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 font-black italic focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Min Order Value</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={minOrderValue}
                                onChange={e => setMinOrderValue(e.target.value)}
                                className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 font-black italic focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Usage Limit</label>
                                <label className="flex items-center gap-2 text-[9px] font-bold text-gray-500 cursor-pointer">
                                    <input type="checkbox" checked={!hasLimit} onChange={(e) => { setHasLimit(!e.target.checked); if (e.target.checked) setUsageLimit(''); }} className="rounded text-indigo-500 focus:ring-indigo-500" />
                                    NO LIMIT
                                </label>
                            </div>
                            <input
                                type="number"
                                disabled={!hasLimit}
                                min="1"
                                required={hasLimit}
                                value={usageLimit}
                                onChange={e => setUsageLimit(e.target.value)}
                                className={`w-full h-14 border-none rounded-2xl px-5 font-black italic transition-all ${!hasLimit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 focus:ring-4 focus:ring-indigo-100 text-gray-900'}`}
                                placeholder={!hasLimit ? "\u221e" : "e.g. 100"}
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-2 flex flex-col">
                            <label className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Valid From</label>
                            <DatePicker
                                selected={validFrom}
                                onChange={(date) => setValidFrom(date)}
                                showTimeSelect
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 font-black text-xs italic text-gray-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <label className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Expiry Date</label>
                            <DatePicker
                                selected={expiryDate}
                                onChange={(date) => setExpiryDate(date)}
                                showTimeSelect
                                minDate={validFrom}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 font-black text-xs italic text-gray-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={(!isEditing && isAvailable === false) || checking}
                        className="w-full h-16 mt-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEditing ? 'Save Changes' : 'Initialize Promo'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PromoCodeFormModal;
