import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiCamera, FiX, FiStar, FiMove } from 'react-icons/fi';

const SortableImage = ({ file, onRemove, onSetPrimary }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    const previewUrl = file.preview || (file.image ? file.image : URL.createObjectURL(file));

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={`relative group bg-white rounded-lg border overflow-hidden aspect-square ${file.is_primary ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-zinc-200 hover:border-zinc-300'}`}
        >
            <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover" 
            />
            
            {/* Drag Handle Overlay */}
            <div 
                {...attributes} 
                {...listeners}
                className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
                <FiMove className="text-white text-xl" />
            </div>

            {/* Actions */}
            <div className="absolute top-2 right-2 flex gap-1 z-20">
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onSetPrimary(file.id); }}
                    className={`p-1.5 rounded-md shadow-sm transition-all ${file.is_primary ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100'}`}
                >
                    <FiStar size={14} />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(file.id); }}
                    className="p-1.5 bg-white text-zinc-400 hover:text-rose-600 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                    <FiX size={14} />
                </button>
            </div>

            {file.is_primary && (
                <div className="absolute bottom-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm z-20">
                    Cover
                </div>
            )}
        </div>
    );
};

const ImageUploader = ({ images, setImages }) => {
    const onDrop = useCallback((acceptedFiles) => {
        const newImages = acceptedFiles.map(file => {
            file.id = Math.random().toString(36).substr(2, 9);
            file.preview = URL.createObjectURL(file);
            file.is_primary = false;
            return file;
        });
        
        setImages(prev => {
            const combined = [...prev, ...newImages];
            if (!combined.some(img => img.is_primary)) {
                combined[0].is_primary = true;
            }
            return combined;
        });
    }, [setImages]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] }
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setImages((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removeImage = (id) => {
        setImages(prev => {
            const filtered = prev.filter(img => img.id !== id);
            if (filtered.length > 0 && !filtered.some(img => img.is_primary)) {
                filtered[0].is_primary = true;
            }
            return filtered;
        });
    };

    const setPrimary = (id) => {
        setImages(prev => prev.map(img => ({
            ...img,
            is_primary: img.id === id
        })));
    };

    return (
        <div className="space-y-6">
            <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-8 transition-all text-center cursor-pointer ${
                    isDragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-zinc-100 text-zinc-400 rounded-lg mb-4">
                        <FiCamera size={32} />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900">Upload Product Shots</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 font-medium italic">High resolution JPG or PNG files recommended</p>
                </div>
            </div>

            {images.length > 0 && (
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext 
                        items={images.map(i => i.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {images.map((image) => (
                                <SortableImage 
                                    key={image.id} 
                                    file={image} 
                                    onRemove={removeImage}
                                    onSetPrimary={setPrimary}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
};

export default ImageUploader;
