'use client'

import { Icon } from '@iconify/react'
import { TermFilters, SortOption, ViewMode } from '../types'
import { getActiveFilterCount } from '../utils'

interface TermToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: TermFilters
  onFilterClick: () => void
  onClearFilters: () => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  resultsCount: number
  hasActiveSearch: boolean
}

export default function TermToolbar({
  searchQuery,
  onSearchChange,
  filters,
  onFilterClick,
  onClearFilters,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultsCount,
  hasActiveSearch,
}: TermToolbarProps) {
  const activeFilterCount = getActiveFilterCount(filters)
  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Icon 
          icon="ph:magnifying-glass-bold" 
          width="20" 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Dönem adı, kodu veya numarası ara..."
          className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Icon icon="ph:x-bold" width="18" />
          </button>
        )}
      </div>

      {/* Filter Button and Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onFilterClick}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              hasActiveFilters
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Icon icon="ph:funnel-bold" width="20" />
            Filtreler
            {hasActiveFilters && (
              <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            <option value="newest">📅 En Yeni</option>
            <option value="oldest">📅 En Eski</option>
            <option value="name">🔤 İsme Göre</option>
            <option value="status">🎯 Duruma Göre</option>
          </select>

          {hasActiveSearch && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {resultsCount} dönem bulundu
              </span>
              <button onClick={onClearFilters} className="text-sm text-blue-600 hover:underline">
                Tümünü Temizle
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Icon icon="ph:squares-four-bold" width="18" />
            <span className="text-sm font-medium">Kart</span>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Icon icon="ph:list-bold" width="18" />
            <span className="text-sm font-medium">Liste</span>
          </button>
        </div>
      </div>
    </div>
  )
}
