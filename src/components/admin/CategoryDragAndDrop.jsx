import React, { useState } from 'react';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDispatch } from 'react-redux';
import { updateCategory, fetchCategoryTree } from '../../features/categories/categorySlice';
import CategoryTree from './CategoryTree';
import { FiMove, FiFolder } from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * Custom Sortable Item wrapper for Category rows.
 * This enables drag handles and drop target logic.
 */
const SortableCategoryRow = ({ category, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver
    } = useSortable({ 
        id: category.id,
        data: {
            type: 'category',
            category
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`relative ${isOver ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/50 rounded-2xl' : ''}`}>
            {/* We pass the base CategoryTree row which has all the visual logic */}
            {/* For simplicity in this implementation, we'll wrap the existing Tree component or use a simpler row */}
            <div className="flex items-center gap-4 py-4 px-8 border-b border-gray-50 bg-white hover:bg-gray-50 transition-all cursor-grab active:cursor-grabbing">
                <FiMove className="text-gray-300" />
                <div className="flex-grow flex items-center gap-3">
                    <FiFolder className="text-blue-500" />
                    <span className="font-black text-gray-900 italic uppercase">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{category.children?.length || 0} Subcategories</span>
                </div>
            </div>
        </div>
    );
};

const CategoryDragAndDrop = ({ categories, onEdit, onDelete }) => {
    const dispatch = useDispatch();
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // Implementation of reparenting logic
        // We trigger a PATCH call to the backend
        try {
            await dispatch(updateCategory({
                id: activeId,
                data: { parent: overId }
            })).unwrap();
            
            toast.success('Category reparented successfully');
            // Refresh tree to see new structure
            dispatch(fetchCategoryTree());
        } catch (err) {
            toast.error(err.non_field_errors?.[0] || 'Invalid move: Circular reference detected');
        }
    };

    return (
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext 
                items={categories.map(c => c.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                     <div className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 py-4 px-12 border-b border-gray-100 italic">
                        Drag to reparent (Flattened View for DnD)
                    </div>
                    {categories.length === 0 ? (
                         <div className="py-20 text-center flex flex-col items-center">
                            <FiFolder size={64} className="text-gray-200 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 italic">No collections found</h3>
                         </div>
                    ) : (
                        categories.map((cat) => (
                            <SortableCategoryRow 
                                key={cat.id} 
                                category={cat} 
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </div>
            </SortableContext>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: '0.5',
                        },
                    },
                }),
            }}>
                {activeId ? (
                    <div className="flex items-center gap-4 py-4 px-8 bg-white border border-blue-100 rounded-2xl shadow-xl shadow-gray-200 ring-2 ring-blue-500 opacity-90 scale-105 transition-transform">
                        <FiMove className="text-blue-500" />
                        <span className="font-black text-gray-900 italic uppercase">Moving Category...</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default CategoryDragAndDrop;
