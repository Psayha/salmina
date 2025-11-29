export const StorySkeleton = () => {
  return (
    <div className="shrink-0">
      <div className="w-[100px] h-[100px] rounded-2xl p-[2px] bg-gray-200 dark:bg-gray-700 animate-pulse">
        <div className="w-full h-full rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
};
