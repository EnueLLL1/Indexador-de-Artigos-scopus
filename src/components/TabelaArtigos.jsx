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
        </tr>
      </thead>
      <tbody>
        {dados.map(a => (
          <tr key={a.id}>
            <td>{a.id}</td>
            <td>{a.titulo}</td>
            <td>{a.ano}</td>
            <td>{a.doi}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

TabelaArtigos.propTypes = {
  dados: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      titulo: PropTypes.string,
      ano: PropTypes.string,
      doi: PropTypes.string,
    })
  ).isRequired,
}
