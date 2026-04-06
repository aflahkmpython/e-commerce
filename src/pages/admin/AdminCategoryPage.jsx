import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchCategoryTree, 
    deleteCategory, 
    createCategory,
    clearError
} from '../../features/categories/categorySlice';
import CategoryTree from '../../components/admin/CategoryTree';
import CategoryDragAndDrop from '../../components/admin/CategoryDragAndDrop';
import EditCategoryModal from '../../components/admin/EditCategoryModal';
import { 
    FiPlus, 
    FiSearch, 
    FiFolder, 
    FiGrid, 
    FiMove,
    FiAlertCircle,
    FiXCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * Recursive search function to filter the category tree.
 * Retains target nodes and their parent chains.
 */
const filterTree = (tree, term) => {
    return tree.filter(node => {
        const nameMatch = node.name.toLowerCase().includes(term.toLowerCase());
        const childrenMatch = node.children && filterTree(node.children, term).length > 0;
        
        if (nameMatch || childrenMatch) {
            // If children matched but name didn't, we need to return the node with filtered children
            if (!nameMatch) {
                node.children = filterTree(node.children, term);
            }
            return true;
        }
        return false;
    });
};

const CategoryPage = () => {
    const dispatch = useDispatch();
    const { tree, loading, error } = useSelector(state => state.categories);

    // Page State
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'drag'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showAddRootForm, setShowAddRootForm] = useState(false);
    const [newRootName, setNewRootName] = useState('');

    useEffect(() => {
        dispatch(fetchCategoryTree());
    }, [dispatch]);

    // Handle generic error from slice (specifically for deletion blocks)
    useEffect(() => {
        if (error) {
            if (error.error && error.error.includes('products')) {
                toast.error(error.error, { duration: 5000, icon: <FiAlertCircle className="text-orange-500" /> });
            } else {
                toast.error(typeof error === 'string' ? error : 'An unexpected error occurred');
            }
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const filteredTree = useMemo(() => {
        if (!searchTerm) return tree;
        // Search across all levels (deep clone before filtering to avoid mutation)
        const treeClone = JSON.parse(JSON.stringify(tree));
        return filterTree(treeClone, searchTerm);
    }, [tree, searchTerm]);

    const flattenedTreeForDnD = useMemo(() => {
        const flattened = [];
        const traverse = (nodes) => {
            nodes.forEach(n => {
                flattened.push(n);
                if (n.children) traverse(n.children);
            });
        };
        traverse(tree);
        return flattened;
    }, [tree]);

    const handleAddRoot = async (e) => {
        e.preventDefault();
        if (!newRootName.trim()) return;

        try {
            await dispatch(createCategory({ name: newRootName })).unwrap();
            setNewRootName('');
            setShowAddRootForm(false);
            toast.success('Root collection added');
        } catch (err) {
            toast.error('Failed to create root category');
        }
    };

    const handleDelete = async (category) => {
        if (window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
            try {
                await dispatch(deleteCategory(category.id)).unwrap();
                toast.success('Collection removed');
            } catch (err) {
                // errors handled by useEffect above
            }
        }
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setIsEditModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter">Collections</h1>
                    <p className="text-gray-500 font-medium">Map out your product hierarchy and categories.</p>
                </div>
                <button 
                    onClick={() => setShowAddRootForm(true)}
                    className="h-14 px-8 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200"
                >
                    <FiPlus size={20} /> Add Root Category
                </button>
            </div>

            {/* Quick Add Form Overlay */}
            {showAddRootForm && (
                <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex-grow">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 block mb-2">New Root Name</label>
                        <input 
                            type="text"
                            autoFocus
                            className="w-full h-12 bg-white border-none rounded-xl px-6 font-black text-gray-900 uppercase italic focus:ring-4 focus:ring-blue-100"
                            placeholder="e.g. ELECTRONICS"
                            value={newRootName}
                            onChange={(e) => setNewRootName(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 self-end pb-1">
                        <button 
                            onClick={handleAddRoot}
                            disabled={!newRootName}
                            className="h-12 px-6 bg-gray-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all"
                        >
                            Create
                        </button>
                        <button 
                            onClick={() => setShowAddRootForm(false)}
                            className="h-12 px-6 bg-white text-gray-400 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Search & Tabs Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-grow max-w-xl relative group">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search hierarchy..."
                        className="w-full h-12 pl-12 pr-4 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm flex items-center">
                    <button 
                        onClick={() => setViewMode('tree')}
                        className={`h-10 px-6 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                            viewMode === 'tree' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                        <FiGrid /> Tree View
                    </button>
                    <button 
                        onClick={() => setViewMode('drag')}
                        className={`h-10 px-6 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                            viewMode === 'drag' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                        <FiMove /> Reparent
                    </button>
                </div>
            </div>

            {/* Main Tree Rendering */}
            {viewMode === 'tree' ? (
                <CategoryTree 
                    categories={filteredTree} 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <CategoryDragAndDrop 
                    categories={flattenedTreeForDnD}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Footer Summary */}
            <div className="flex justify-center">
                 <div className="px-6 py-2 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                    Total Tree Footprint: {flattenedTreeForDnD.length} Collections
                 </div>
            </div>

            <EditCategoryModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                category={selectedCategory}
            />
        </div>
    );
};

export default CategoryPage;
