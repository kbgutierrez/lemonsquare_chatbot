import { useMemo, useState, useEffect } from "react"

export const usePagination = ({ items, itemsPerPage = 10, resetDeps = [] }) => {
  const [page, setPage] = useState(1)
  const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / itemsPerPage)), [items, itemsPerPage])
  const paginatedItems = useMemo(() => items.slice((page - 1) * itemsPerPage, page * itemsPerPage), [items, page, itemsPerPage])

  useEffect(() => { setPage(1) }, resetDeps)
  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [totalPages, page])

  return { page, setPage, totalPages, paginatedItems }
}

export default usePagination
