export default function ProductsLoading() {
  return (
    <div className="bg-[#F8F4EA] min-h-screen animate-pulse">
      <div className="bg-[#050505] py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-8 w-48 bg-white/10 rounded mx-auto" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-3 mb-6">
          <div className="h-10 flex-1 bg-gray-200 rounded" />
          <div className="h-10 w-36 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
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
  );
}
