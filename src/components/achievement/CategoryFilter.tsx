interface CategoryFilterProps {
  categories: string[]
  selected: string
  onChange: (cat: string) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  all: '全部',
  daily: '日常',
  task: '任务',
  raccoon: '小浣熊',
  social: '社交',
  collection: '收集',
  special: '特殊',
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === cat
              ? 'bg-amber-500 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600'
          }`}
        >
          {CATEGORY_LABELS[cat] ?? cat}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
