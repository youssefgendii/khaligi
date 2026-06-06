export default function StoreLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-[#050505] py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="h-6 w-24 bg-[#D6B25E20] rounded mx-auto" />
          <div className="h-12 w-80 bg-white/10 rounded mx-auto" />
          <div className="h-4 w-64 bg-white/5 rounded mx-auto" />
          <div className="flex gap-3 justify-center pt-2">
            <div className="h-10 w-36 bg-[#D6B25E30] rounded" />
            <div className="h-10 w-36 bg-white/5 rounded" />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="bg-[#F8F4EA] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded overflow-hidden border border-gray-100">
                <div className="aspect-[3/4] bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                  <div className="h-4 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
