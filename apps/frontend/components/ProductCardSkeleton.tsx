export const ProductCardSkeleton = () => {
  return (
    <div className="group bg-[var(--card-bg)] backdrop-blur-md rounded-2xl overflow-hidden border border-[var(--card-border)] shadow-lg flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-square bg-white/30 dark:bg-white/5 backdrop-blur-sm border-b border-[var(--card-border)] shrink-0" />

      {/* Content Skeleton */}
      <div className="p-2.5 space-y-2 flex flex-col grow">
        {/* Title */}
        <div className="h-4 bg-white/40 dark:bg-white/10 rounded w-3/4" />

        {/* Description */}
        <div className="space-y-1 grow">
          <div className="h-3 bg-white/30 dark:bg-white/5 rounded w-full" />
          <div className="h-3 bg-white/30 dark:bg-white/5 rounded w-5/6" />
        </div>

        {/* Price & Button */}
        <div className="pt-1.5 flex items-center justify-between border-t border-[var(--card-border)] shrink-0">
          <div className="h-4 bg-white/40 dark:bg-white/10 rounded w-20" />
          <div className="w-8 h-8 bg-white/30 dark:bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
};
