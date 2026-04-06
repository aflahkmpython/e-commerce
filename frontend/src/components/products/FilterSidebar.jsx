import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../features/products/productSlice';
import { useSearchParams } from 'react-router-dom';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const CategoryItem = ({ category, onSelect, activeSlug }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = category.children && category.children.length > 0;

    return (
        <div className="ml-2">
            <div 
                className={`flex items-center py-2 px-2 rounded-md cursor-pointer transition-colors ${activeSlug === category.slug ? 'bg-primary-50 text-primary-600 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
                onClick={() => onSelect(category.slug)}
            >
                {hasChildren && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                        className="mr-1 text-gray-400 hover:text-gray-600"
                    >
                        {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                    </button>
                )}
                <span className="text-sm">{category.name}</span>
            </div>
            {isOpen && hasChildren && (
                <div className="border-l border-gray-200 ml-3">
                    {category.children.map(child => (
                        <CategoryItem 
                            key={child.id} 
                            category={child} 
                            onSelect={onSelect} 
                            activeSlug={activeSlug} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FilterSidebar = () => {
    const dispatch = useDispatch();
    const { categories } = useSelector((state) => state.products);
    const [searchParams, setSearchParams] = useSearchParams();
    
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const updateParams = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const handleCategorySelect = (slug) => {
        updateParams('category', slug === searchParams.get('category') ? null : slug);
    };

    return (
        <aside className="w-full md:w-64 bg-white p-6 border-r border-gray-200 h-full overflow-y-auto">
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Categories</h3>
                <div className="space-y-1">
                    {categories.map(cat => (
                        <CategoryItem 
                            key={cat.id} 
                            category={cat} 
                            onSelect={handleCategorySelect} 
                            activeSlug={searchParams.get('category')}
                        />
                    ))}
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Price Range</h3>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            placeholder="Min"
                            className="w-1/2 p-2 border border-gray-300 rounded-md text-sm"
                            value={searchParams.get('min_price') || ''}
                            onChange={(e) => updateParams('min_price', e.target.value)}
                        />
                        <input 
                            type="number" 
                            placeholder="Max"
                            className="w-1/2 p-2 border border-gray-300 rounded-md text-sm"
                            value={searchParams.get('max_price') || ''}
                            onChange={(e) => updateParams('max_price', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Availability</h3>
                <label className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        checked={searchParams.get('in_stock') === 'true'}
                        onChange={(e) => updateParams('in_stock', e.target.checked ? 'true' : null)}
                    />
                    <span className="text-gray-700 group-hover:text-primary-600 transition-colors">In Stock Only</span>
                </label>
            </div>
        </aside>
    );
};

export default FilterSidebar;
