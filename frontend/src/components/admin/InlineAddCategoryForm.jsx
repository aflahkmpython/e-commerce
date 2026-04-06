import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createCategory } from '../../features/categories/categorySlice';
import { FiSave, FiX, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * JavaScript implementation of Django's slugify.
 */
const slugifyForPreview = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

/**
 * Inline form for quick subcategory additions.
 */
const InlineAddCategoryForm = ({ parentId, parentName, onSuccess, onCancel }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const slugPreview = slugifyForPreview(name);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Name is required');

        setSubmitting(true);
        try {
            await dispatch(createCategory({
                name,
                description,
                parent: parentId
            })).unwrap();
            
            toast.success(`Subcategory added to ${parentName}`);
            onSuccess();
        } catch (err) {
            toast.error(err.error || 'Failed to add subcategory');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl bg-white p-8 rounded-[2rem] shadow-sm border border-blue-50/50">
            <div className="flex items-center gap-3 mb-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FiInfo size={16} /></span>
                <h4 className="text-sm font-black text-gray-900 uppercase italic">Add subcategory to <span className="text-blue-600">{parentName}</span></h4>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Subcategory Name</label>
                    <input 
                        type="text"
                        autoFocus
                        placeholder="e.g. Smartphones"
                        className="w-full h-12 bg-gray-50 border-none rounded-xl px-6 font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {name && (
                        <p className="text-[10px] text-gray-400 italic px-4">
                            URL Preview: <span className="font-black text-blue-500">/category/{slugPreview}/</span>
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Short Description</label>
                    <textarea 
                        placeholder="Describe this collection..."
                        className="w-full h-24 bg-gray-50 border-none rounded-xl p-4 font-medium text-gray-700 focus:ring-4 focus:ring-blue-100 resize-none transition-all text-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-12 bg-gray-900 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                >
                    <FiSave /> {submitting ? 'Saving...' : 'Add Collection'}
                </button>
                <button 
                    type="button"
                    onClick={onCancel}
                    className="h-12 px-6 bg-gray-50 text-gray-400 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default InlineAddCategoryForm;
export { slugifyForPreview };
