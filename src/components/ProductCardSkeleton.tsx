const ProductCardSkeleton = () => (
  <div className="flex-shrink-0 w-72">
    <div className="w-full border border-white/10 bg-gradient-to-t from-[#333333] to-[#2E2E2E] rounded-3xl overflow-hidden shadow-lg h-full animate-pulse">
      {/* imagem */}
      <div className="bg-[#2E2E2E] p-6 flex items-center justify-center h-48 rounded-t-3xl">
        <div className="w-28 h-28 rounded-xl bg-gray-700" />
      </div>

      <div className="p-6 space-y-3">
        {/* nome */}
        <div className="h-5 w-3/4 rounded bg-gray-700" />
        {/* subtítulo */}
        <div className="h-3.5 w-1/2 rounded bg-gray-700" />

        {/* características */}
        <div className="space-y-2 pt-1">
          {[75, 60, 80, 55].map((w, i) => (
            <div key={i} className={`h-3 rounded bg-gray-700`} style={{ width: `${w}%` }} />
          ))}
        </div>

        {/* preço */}
        <div className="h-5 w-16 rounded bg-gray-700 mt-2" />

        {/* botões */}
        <div className="flex space-x-2 pt-1">
          <div className="flex-1 h-8 rounded-full bg-gray-700" />
          <div className="flex-1 h-8 rounded-full bg-gray-700" />
        </div>
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;
