import PropTypes from 'prop-types'

export function TabelaAutores({ dados }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Autores</th>
        </tr>
      </thead>
      <tbody>
        {dados.map(a => (
          <tr key={a.id}>
            <td>{a.id}</td>
            <td>
              <div className="badges">
                {a.nome.split(';').map((nome, i) => (
                  <span key={i} className="badge">
                    {nome.trim()}
                  </span>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

TabelaAutores.propTypes = {
  dados: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nome: PropTypes.string.isRequired,
    })
  ).isRequired,
}
