import React, { useState } from 'react';
import { 
    FiChevronRight, 
    FiChevronDown, 
    FiPlus, 
    FiEdit2, 
    FiTrash2, 
    FiFolder,
    FiPackage
} from 'react-icons/fi';
import InlineAddCategoryForm from './InlineAddCategoryForm';

/**
 * Individual Category Row component with actions and expansion logic.
 */
const CategoryRow = ({ category, level, onEdit, onDelete, onAdd }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const hasChildren = category.children && category.children.length > 0;
    const paddingLeft = level * 32;

    return (
        <div className="flex flex-col border-b border-gray-50 last:border-0">
            <div 
                className={`flex items-center gap-4 py-4 px-8 hover:bg-gray-50 transition-colors group ${isExpanded ? 'bg-gray-50/30' : ''}`}
                style={{ paddingLeft: `${paddingLeft + 32}px` }}
            >
                {/* Expand/Collapse Arrow */}
                <div className="flex-shrink-0 w-8">
                    {hasChildren && (
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-white rounded-lg shadow-sm transition-all text-gray-400 hover:text-blue-600"
                        >
                            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                    )}
                </div>

                {/* Name & Badge */}
                <div className="flex-grow flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${category.parent ? 'bg-white text-gray-400' : 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm'}`}>
                        {category.parent ? <FiFolder size={16} /> : <FiPackage size={16} />}
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 italic uppercase leading-none mb-1">{category.name}</h4>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">{category.slug}</span>
                    </div>
                </div>

                {/* Product Count Badge */}
                <div className="px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {category.product_count} Products
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg shadow-sm font-black text-[10px] uppercase flex items-center gap-1"
                    >
                        <FiPlus /> Sub
                    </button>
                    <button 
                        onClick={() => onEdit(category)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg shadow-sm"
                    >
                        <FiEdit2 size={16} />
                    </button>
                    <button 
                        onClick={() => onDelete(category)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg shadow-sm"
                    >
                        <FiTrash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Inline Add Form */}
            {showAddForm && (
                <div className="bg-blue-50/30 p-6 border-y border-blue-100" style={{ paddingLeft: `${paddingLeft + 64}px` }}>
                    <InlineAddCategoryForm 
                        parentId={category.id} 
                        parentName={category.name}
                        onSuccess={() => setShowAddForm(false)}
                        onCancel={() => setShowAddForm(false)}
                    />
                </div>
            )}

            {/* Recursively Render Children */}
            {isExpanded && hasChildren && (
                <div className="flex flex-col">
                    {category.children.map(child => (
                        <CategoryRow 
                            key={child.id} 
                            category={child} 
                            level={level + 1} 
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                            onAdd={onAdd}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * Tree Container Component.
 */
const CategoryTree = ({ categories, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 py-4 px-12 border-b border-gray-100 flex justify-between items-center">
                <span>Collections & Nesting</span>
                <span>Actions</span>
            </div>
            
            <div className="flex flex-col">
                {categories.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="p-8 bg-gray-50 text-gray-300 rounded-[2.5rem] mb-4">
                            <FiFolder size={64} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 italic uppercase">No Categories Created</h3>
                        <p className="text-gray-400 font-medium">Start building your collection tree using the "Add Category" button.</p>
                    </div>
                ) : (
                    categories.map(cat => (
                        <CategoryRow 
                            key={cat.id} 
                            category={cat} 
                            level={0} 
                            onEdit={onEdit} 
                            onDelete={onDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default CategoryTree;
