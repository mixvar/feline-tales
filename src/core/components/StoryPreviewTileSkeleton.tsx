export const StoryPreviewTileSkeleton = () => {
  return (
    <div className="bg-white bg-opacity-30 rounded-xl shadow-lg overflow-hidden">
      <div className="flex">
        <div className="w-1/3 flex-shrink-0 overflow-hidden">
          <div className="w-full h-[150px] bg-gray-200 bg-opacity-50 animate-pulse" />
        </div>
        <div className="p-4 w-2/3 flex flex-col gap-2">
          <div className="h-6 w-3/4 bg-gray-200 bg-opacity-50 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-200 bg-opacity-50 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 bg-opacity-50 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 bg-opacity-50 rounded animate-pulse w-11/12" />
            <div className="h-4 bg-gray-200 bg-opacity-50 rounded animate-pulse w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
};
