export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm flex flex-col animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 shrink-0" />

      {/* Content Skeleton - fixed height to match ProductCard */}
      <div className="p-3 flex flex-col h-[88px]">
        {/* Title */}
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />

        {/* Price */}
        <div className="mt-auto h-5 bg-gray-100 dark:bg-gray-800 rounded w-20" />
      </div>
    </div>
  );
};
