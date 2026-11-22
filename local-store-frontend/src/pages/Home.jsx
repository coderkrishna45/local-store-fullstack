import { useState, useEffect } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { Search, ChevronRight } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        if (!cancelled) setCategories(data);
      } catch (error) {
        if (!cancelled) setCategories([]);
      }
    };
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [refreshCount]);

  useEffect(() => {
    let cancelled = false;
    const loadProducts = async () => {
      try {
        setLoading(true);
        setCatalogError(false);
        const { data } = await api.get('/api/products', {
          params: { keyword: debouncedKeyword },
        });
        if (!cancelled) setProducts(data);
      } catch (error) {
        if (!cancelled) setCatalogError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [debouncedKeyword, refreshCount]);

  // Group products by category
  let groupedProducts = categories.map(cat => ({
    ...cat,
    products: products.filter(p => p.category && p.category._id === cat._id)
  })).filter(cat => cat.products.length > 0);

  // If a specific category is selected, only show that category
  if (selectedCategory) {
    groupedProducts = groupedProducts.filter(cat => cat._id === selectedCategory);
  }

  // If there are products without category or search is active, show them too
  const categoryIds = new Set(categories.map(category => category._id));
  const uncategorized = selectedCategory ? [] : products.filter(p => !categoryIds.has(p.category?._id));
  const visibleProducts = selectedCategory
    ? groupedProducts.flatMap(group => group.products)
    : products;

  return (
    <div className="pb-24"> {/* Padding bottom for floating cart */}
      <section className="mb-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-6 py-7 sm:px-9 sm:py-9">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">Groceries and daily essentials</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
          Browse fresh produce and pantry staples, then pay for your order on delivery.
        </p>
      </section>
      {/* Top Search Bar (Mobile optimized style) */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="relative max-w-3xl mx-auto">
          <input
            type="search"
            aria-label="Search products"
            placeholder="Search groceries and household essentials"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setSelectedCategory(null); }}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Categories Pill Bar */}
      {!keyword && categories.length > 0 && (
        <div className="flex overflow-x-auto hide-scrollbar py-4 space-x-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm ${!selectedCategory ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`whitespace-nowrap px-4 py-2 border rounded-full text-sm font-semibold transition-colors shadow-sm ${selectedCategory === cat._id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div role="status" className="flex justify-center py-20">
          <span className="sr-only">Loading products</span>
          <div aria-hidden="true" className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : catalogError ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p role="alert" className="text-gray-700">The catalog is temporarily unavailable.</p>
          <button type="button" onClick={() => setRefreshCount(count => count + 1)} className="mt-4 font-semibold text-blue-700">
            Try again
          </button>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xl font-medium text-gray-500">{keyword ? `No products found for “${keyword}”` : 'No products found'}</p>
        </div>
      ) : (
        <div className="space-y-12 mt-4">
          {/* If searching, just show a flat grid */}
          {keyword || selectedCategory ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {visibleProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            /* If not searching, show Zepto style horizontal rows grouped by category */
            groupedProducts.map(group => (
              <section key={group._id} className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">{group.name}</h3>
                  <button
                    onClick={() => setSelectedCategory(group._id)}
                    className="text-blue-600 font-bold text-sm flex items-center hover:text-blue-700"
                  >
                    See All <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                {/* Horizontal Scrollable Row */}
                <div className="flex overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-4 sm:space-x-6 snap-x">
                  {group.products.map(product => (
                    <div key={product._id} className="w-[160px] sm:w-[200px] flex-none snap-start">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}

          {uncategorized.length > 0 && !keyword && (
            <section>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">More Items</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {uncategorized.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
