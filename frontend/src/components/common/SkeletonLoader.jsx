import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse border border-gray-200 shadow-sm h-full">
      <div className="bg-gray-200 h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded-full w-24" />
        <div className="h-6 bg-gray-200 rounded-full w-full" />
        <div className="h-4 bg-gray-200 rounded-full w-16" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 bg-gray-200 rounded-full w-20" />
          <div className="h-10 bg-gray-200 rounded-xl w-10" />
        </div>
      </div>
    </div>
  );

  const ProductDetailSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-3xl" />
      <div className="space-y-6 pt-4">
        <div className="h-4 bg-gray-200 rounded-full w-24" />
        <div className="h-12 bg-gray-200 rounded-full w-3/4" />
        <div className="h-4 bg-gray-200 rounded-full w-16" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-full w-full" />
          <div className="h-4 bg-gray-200 rounded-full w-5/6" />
          <div className="h-4 bg-gray-200 rounded-full w-4/6" />
        </div>
        <div className="h-14 bg-gray-200 rounded-2xl w-full" />
      </div>
    </div>
  );

  const skeletons = Array(count).fill(0);

  return (
    <div className={`
      ${type === 'card' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'w-full'}
    `}>
      {skeletons.map((_, i) => (
        <React.Fragment key={i}>
          {type === 'card' ? <CardSkeleton /> : <ProductDetailSkeleton />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SkeletonLoader;
