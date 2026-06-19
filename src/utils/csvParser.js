import { CSV_COLUMNS } from '../constants'

export function parseCSVData(data) {
  const artigos = []
  const autores = []
  const referencias = []
  const keywords = []
  const isbns = []
  const openAccess = []
  
  let autorId = 1
  let referenciaId = 1
  let keywordId = 1
  let isbnId = 1
  let openAccessId = 1

  data.forEach((item, index) => {
    const artigoId = index + 1
    
    // Extrai todos os campos do artigo conforme schema do Supabase
    if (item[CSV_COLUMNS.TITLE] || item[CSV_COLUMNS.YEAR] || item[CSV_COLUMNS.DOI]) {
      const artigo = {
        id: artigoId,
        titulo: item[CSV_COLUMNS.TITLE] || null,
        ano: item[CSV_COLUMNS.YEAR] || null,
        source_title: item[CSV_COLUMNS.SOURCE_TITLE] || null,
        cited_by: item[CSV_COLUMNS.CITED_BY] || null,
        link: item[CSV_COLUMNS.LINK] || null,
        doi: item[CSV_COLUMNS.DOI] || null,
        resumo: item[CSV_COLUMNS.ABSTRACT] || null,
        issn: item[CSV_COLUMNS.ISSN] || null,
        coden: item[CSV_COLUMNS.CODEN] || null,
        linguagem: item[CSV_COLUMNS.LANGUAGE] || null,
        tipo: item[CSV_COLUMNS.TYPE] || null,
        source: item[CSV_COLUMNS.SOURCE] || null,
        isbn: item[CSV_COLUMNS.ISBN] || null,
      }
      artigos.push(artigo)

      // Autores (pode ter múltiplos por artigo)
      if (item[CSV_COLUMNS.AUTHORS]) {
        const autoresLista = item[CSV_COLUMNS.AUTHORS].split(';').map(a => a.trim()).filter(a => a)
        autoresLista.forEach(nome => {
          autores.push({ id: autorId++, nome, artigoId })
        })
      }

      // Referências (pode ter múltiplas por artigo)
      if (item[CSV_COLUMNS.REFERENCES]) {
        const referenciasLista = item[CSV_COLUMNS.REFERENCES].split(';').map(r => r.trim()).filter(r => r)
        referenciasLista.forEach(nome => {
          referencias.push({ id: referenciaId++, nome, artigoId })
        })
      }

      // Keywords (pode ter múltiplas por artigo)
      if (item[CSV_COLUMNS.KEYWORDS]) {
        const keywordsLista = item[CSV_COLUMNS.KEYWORDS].split(';').map(k => k.trim()).filter(k => k)
        keywordsLista.forEach(nome => {
          keywords.push({ id: keywordId++, nome, artigoId })
        })
      }

      // ISBN (se houver)
      if (item[CSV_COLUMNS.ISBN]) {
        isbns.push({ id: isbnId++, valor: item[CSV_COLUMNS.ISBN], artigoId })
      }

      // Open Access (se houver)
      if (item[CSV_COLUMNS.OPEN_ACCESS]) {
        openAccess.push({ id: openAccessId++, tipo: item[CSV_COLUMNS.OPEN_ACCESS], artigoId })
      }
    }
  })

  return { artigos, autores, referencias, keywords, isbns, openAccess }
}
