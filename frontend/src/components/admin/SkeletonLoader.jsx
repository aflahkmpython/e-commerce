import React from 'react';

export const SkeletonLoader = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded-2xl ${className}`}></div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <SkeletonLoader key={i} className="h-32" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonLoader className="h-80" />
            <SkeletonLoader className="h-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonLoader className="h-96" />
            <SkeletonLoader className="h-96" />
        </div>
    </div>
);
