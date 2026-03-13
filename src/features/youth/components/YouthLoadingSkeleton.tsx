export function YouthLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow animate-pulse">
            <div className="h-8 w-12 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-100 rounded" />
                <div className="h-8 w-20 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
