import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import themeCatalog from '../data/themes.json'

const FAVORITES_KEY = 'skala-escape-room-favorites'

function readFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY))
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

export const useEscapeRoomStore = defineStore('escapeRoom', () => {
  const regions = ref(themeCatalog.regions)
  const validThemeIds = new Set(
    themeCatalog.regions.flatMap((region) =>
      region.branches.flatMap((branch) => branch.themes.map((theme) => theme.id)),
    ),
  )
  const selectedRegionId = ref(themeCatalog.regions[0]?.id ?? '')
  const selectedBranchId = ref(themeCatalog.regions[0]?.branches[0]?.id ?? '')
  const searchQuery = ref('')
  const selectedGenre = ref('전체')
  const favoriteOnly = ref(false)
  const favoriteThemeIds = ref(readFavorites().filter((themeId) => validThemeIds.has(themeId)))

  const selectedRegion = computed(
    () => regions.value.find((region) => region.id === selectedRegionId.value) ?? null,
  )

  const selectedBranch = computed(
    () =>
      selectedRegion.value?.branches.find((branch) => branch.id === selectedBranchId.value) ?? null,
  )

  const allThemes = computed(() =>
    regions.value.flatMap((region) =>
      region.branches.flatMap((branch) =>
        branch.themes.map((theme) => ({
          ...theme,
          area: region.name,
          branchId: branch.id,
          branchName: branch.name,
          branchBrand: branch.brand,
          reservationUrl: branch.reservationUrl,
        })),
      ),
    ),
  )

  const genreOptions = computed(() =>
    [...new Set(allThemes.value.map((theme) => theme.genre).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'ko-KR'),
    ),
  )

  const isGlobalMode = computed(
    () =>
      Boolean(searchQuery.value.trim()) || selectedGenre.value !== '전체' || favoriteOnly.value,
  )

  const visibleThemes = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase('ko-KR')
    const sourceThemes = isGlobalMode.value
      ? allThemes.value
      : allThemes.value.filter((theme) => theme.branchId === selectedBranchId.value)

    return sourceThemes.filter((theme) => {
      const matchesQuery =
        !query ||
        [
          theme.title,
          theme.genre,
          theme.description,
          theme.area,
          theme.branchName,
          theme.branchBrand,
        ]
          .filter(Boolean)
          .some((value) => value.toLocaleLowerCase('ko-KR').includes(query))
      const matchesGenre = selectedGenre.value === '전체' || theme.genre === selectedGenre.value
      const matchesFavorite = !favoriteOnly.value || favoriteThemeIds.value.includes(theme.id)

      return matchesQuery && matchesGenre && matchesFavorite
    })
  })

  const branchCount = computed(() =>
    regions.value.reduce((count, region) => count + region.branches.length, 0),
  )

  const themeCount = computed(() =>
    regions.value.reduce(
      (count, region) =>
        count + region.branches.reduce((sum, branch) => sum + branch.themes.length, 0),
      0,
    ),
  )

  function selectRegion(regionId) {
    selectedRegionId.value = regionId
    selectedBranchId.value = selectedRegion.value?.branches[0]?.id ?? ''
    clearGlobalFilters()
  }

  function selectBranch(branchId) {
    selectedBranchId.value = branchId
    clearGlobalFilters()
  }

  function clearGlobalFilters() {
    searchQuery.value = ''
    selectedGenre.value = '전체'
    favoriteOnly.value = false
  }

  function isFavorite(themeId) {
    return favoriteThemeIds.value.includes(themeId)
  }

  function toggleFavorite(themeId) {
    favoriteThemeIds.value = isFavorite(themeId)
      ? favoriteThemeIds.value.filter((id) => id !== themeId)
      : [...favoriteThemeIds.value, themeId]
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteThemeIds.value))
  }

  return {
    updatedAt: themeCatalog.updatedAt,
    notice: themeCatalog.notice,
    regions,
    selectedRegionId,
    selectedBranchId,
    selectedRegion,
    selectedBranch,
    searchQuery,
    selectedGenre,
    favoriteOnly,
    favoriteThemeIds,
    visibleThemes,
    allThemes,
    genreOptions,
    isGlobalMode,
    branchCount,
    themeCount,
    selectRegion,
    selectBranch,
    clearGlobalFilters,
    isFavorite,
    toggleFavorite,
  }
})
