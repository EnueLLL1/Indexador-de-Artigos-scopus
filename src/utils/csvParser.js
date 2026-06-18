import { CSV_COLUMNS } from '../constants'

export function parseCSVData(data) {
  const artigos = []
  const autores = []
  const referencias = []
  const keywords = []
  
  let autorId = 1
  let referenciaId = 1
  let keywordId = 1

  data.forEach((item, index) => {
    const artigoId = index + 1
    
    if (item[CSV_COLUMNS.TITLE] || item[CSV_COLUMNS.YEAR] || item[CSV_COLUMNS.DOI]) {
      artigos.push({
        id: artigoId,
        titulo: item[CSV_COLUMNS.TITLE],
        ano: item[CSV_COLUMNS.YEAR],
        doi: item[CSV_COLUMNS.DOI],
      })
    }
    
    if (item[CSV_COLUMNS.AUTHORS]) {
      autores.push({ id: autorId++, nome: item[CSV_COLUMNS.AUTHORS] })
    }
    
    if (item[CSV_COLUMNS.REFERENCES]) {
      referencias.push({
        id: referenciaId++,
        nome: item[CSV_COLUMNS.REFERENCES],
      })
    }
    
    if (item[CSV_COLUMNS.KEYWORDS]) {
      keywords.push({
        id: keywordId++,
        nome: item[CSV_COLUMNS.KEYWORDS],
      })
    }
  })

  return { artigos, autores, referencias, keywords }
}
