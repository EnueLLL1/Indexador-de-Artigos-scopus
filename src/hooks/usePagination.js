import { useState, useEffect } from 'react'

export function usePagination(data, itemsPerPage) {
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    setPagina(1)
  }, [data])

  const totalPaginas = Math.ceil(data.length / itemsPerPage)
  const inicio = (pagina - 1) * itemsPerPage
  const dadosPagina = data.slice(inicio, inicio + itemsPerPage)

  return {
    pagina,
    setPagina,
    totalPaginas,
    dadosPagina,
  }
}
