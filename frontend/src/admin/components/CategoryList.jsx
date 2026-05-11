/**
 * CategoryList Component
 * Displays available categories for filtering knowledge files
 * Compact vertical list with modern purple styling
 */

const CategoryList = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="rounded-lg border border-purple-200 bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-3">
        Categories
      </p>
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full rounded-2xl px-3 py-2 text-left text-sm transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-900 hover:bg-purple-50'
            }`}
          >
            <p className="font-semibold truncate">{category.name}</p>
            {selectedCategory === category.id && (
              <p className="mt-1 text-xs text-purple-100/90">{category.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryList
