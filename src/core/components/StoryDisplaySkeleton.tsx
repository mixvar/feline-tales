export const StoryDisplaySkeleton = () => {
  return (
    <div className="w-full max-w-6xl flex flex-col gap-6">
      <div className="bg-white bg-opacity-30 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 md:flex-shrink-0 overflow-hidden">
            <div className="w-full h-[300px] md:h-[500px] bg-gray-200 bg-opacity-50 animate-pulse" />
          </div>
          <div className="p-6 md:w-1/2 md:overflow-y-auto md:max-h-[500px]">
            <div className="h-8 md:h-10 w-3/4 bg-gray-200 bg-opacity-50 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 bg-opacity-50 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 bg-opacity-50 rounded animate-pulse w-11/12" />
              <div className="h-4 bg-gray-200 bg-opacity-50 rounded animate-pulse w-4/5" />
              <div className="h-4 bg-gray-200 bg-opacity-50 rounded animate-pulse w-9/12" />
              <div className="h-4 bg-gray-200 bg-opacity-50 rounded animate-pulse w-10/12" />
              <div className="h-4 bg-gray-200 bg-opacity-50 rounded animate-pulse w-8/12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
