import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCategory } from '../../features/categories/categorySlice';
import { slugifyForPreview } from './InlineAddCategoryForm';
import { FiX, FiSave, FiAlertCircle, FiChevronRight, FiFolderPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/**
 * Utility to flatten a nested tree while excluding a specific ID and its descendants.
 */
const flattenTreeExcluding = (tree, excludeId, level = 0, flattened = []) => {
    tree.forEach(node => {
        if (node.id === excludeId) return; // Skip excluded node and its children
        
        flattened.push({ 
            id: node.id, 
            name: node.name, 
            level, 
            path: node.name 
        });
        
        if (node.children && node.children.length > 0) {
            flattenTreeExcluding(node.children, excludeId, level + 1, flattened);
        }
    });
    return flattened;
};

/**
 * Utility to find the full path of category names for breadcrumb display.
 */
const findCategoryPath = (tree, targetId, currentPath = []) => {
    for (const node of tree) {
        if (node.id === targetId) return [...currentPath, node.name];
        if (node.children) {
            const found = findCategoryPath(node.children, targetId, [...currentPath, node.name]);
            if (found) return found;
        }
    }
    return null;
};

const EditCategoryModal = ({ isOpen, onClose, category }) => {
    const dispatch = useDispatch();
    const { tree } = useSelector(state => state.categories);
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description || '');
            setParentId(category.parent || '');
        }
    }, [category]);

    const slugPreview = useMemo(() => slugifyForPreview(name), [name]);
    
    const availableParents = useMemo(() => {
        if (!category) return [];
        return flattenTreeExcluding(tree, category.id);
    }, [tree, category]);

    const ancestry = useMemo(() => {
        if (!category) return [];
        return findCategoryPath(tree, category.id);
    }, [tree, category]);

    if (!isOpen || !category) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await dispatch(updateCategory({
                id: category.id,
                data: {
                    name,
                    description,
                    parent: parentId || null
                }
            })).unwrap();
            toast.success('Collection updated successfully');
            onClose();
        } catch (err) {
            toast.error(err.non_field_errors?.[0] || 'Validation failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative border border-gray-100"
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-8 right-8 p-3 bg-gray-50 text-gray-400 hover:text-black rounded-2xl transition-all z-20"
                    >
                        <FiX size={20} />
                    </button>

                    <form onSubmit={handleSubmit} className="p-12 space-y-10">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FiFolderPlus size={16} /></span>
                                <h3 className="text-xl font-black text-gray-900 italic uppercase">Modify Collection</h3>
                            </div>
                            {ancestry && (
                                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-10">
                                    {ancestry.map((n, i) => (
                                        <React.Fragment key={i}>
                                            <span className={i === ancestry.length - 1 ? 'text-blue-600' : ''}>{n}</span>
                                            {i < ancestry.length - 1 && <FiChevronRight />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fields */}
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-4">Collection Title</label>
                                <input 
                                    className="w-full h-14 bg-gray-50 border-none rounded-2xl px-8 font-black text-gray-900 italic uppercase focus:ring-4 focus:ring-blue-100 transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Smartwatches"
                                />
                                <p className="text-[10px] text-gray-400 italic px-4">
                                    Slug Update: <span className="font-bold">/category/{slugPreview}/</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-4">Parent Collection</label>
                                <select 
                                    className="w-full h-14 bg-gray-50 border-none rounded-2xl px-8 font-black text-gray-900 italic uppercase focus:ring-4 focus:ring-blue-100 transition-all appearance-none"
                                    value={parentId}
                                    onChange={(e) => setParentId(e.target.value)}
                                >
                                    <option value="">Root (No Parent)</option>
                                    {availableParents.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {'\u00A0'.repeat(p.level * 4)}{p.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest px-4 flex items-center gap-1">
                                    <FiAlertCircle /> Circular paths are automatically hidden
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-4">Collection Bio</label>
                                <textarea 
                                    className="w-full h-32 bg-gray-50 border-none rounded-3xl p-8 font-medium text-gray-700 focus:ring-4 focus:ring-blue-100 resize-none transition-all"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the nature of this category tree..."
                                />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-4 pt-4">
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="flex-1 h-16 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200"
                            >
                                <FiSave size={20} /> {submitting ? 'Applying...' : 'Save Configuration'}
                            </button>
                            <button 
                                type="button"
                                onClick={onClose}
                                className="px-10 h-16 bg-gray-50 text-gray-400 rounded-3xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                            >
                                Dismiss
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditCategoryModal;
