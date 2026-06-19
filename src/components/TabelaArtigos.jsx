import PropTypes from 'prop-types'

export function TabelaArtigos({ dados }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Título</th>
          <th>Ano</th>
          <th>DOI</th>
          <th>Resumo</th>
          <th>ISSN</th>
          <th>ISBN</th>
          <th>Tipo</th>
        </tr>
      </thead>
      <tbody>
        {dados.map(a => (
          <tr key={a.id}>
            <td>{a.id}</td>
            <td>{a.titulo}</td>
            <td>{a.ano}</td>
            <td>{a.doi || 'Sem dados'}</td>
            <td className="truncate" title={a.resumo}>{a.resumo || ''}</td>
            <td>{a.issn}</td>
            <td>{a.isbn}</td>
            <td><span className={`pill pill-${getTipoClass(a.tipo)}`}>{a.tipo || ''}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function getTipoClass(tipo) {
  const classes = {
    'Article': 'article',
    'Review': 'article',
    'Short survey': 'article',
    'Conference paper': 'conference',
    'Conference review': 'conference',
    'Book chapter': 'book',
    'Book': 'book',
  }
  return classes[tipo] || 'other'
}

TabelaArtigos.propTypes = {
  dados: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      titulo: PropTypes.string,
      ano: PropTypes.string,
      doi: PropTypes.string,
      resumo: PropTypes.string,
      issn: PropTypes.string,
      isbn: PropTypes.string,
      tipo: PropTypes.string,
    })
  ).isRequired,
}
