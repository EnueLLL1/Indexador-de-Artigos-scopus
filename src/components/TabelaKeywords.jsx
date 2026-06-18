import PropTypes from 'prop-types'

export function TabelaKeywords({ dados }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Palavras-chave</th>
        </tr>
      </thead>
      <tbody>
        {dados.map(k => (
          <tr key={k.id}>
            <td>{k.id}</td>
            <td>
              <div className="badges">
                {k.nome.split(';').map((kw, i) => (
                  <span key={i} className="badge badge-kw">
                    {kw.trim()}
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

TabelaKeywords.propTypes = {
  dados: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nome: PropTypes.string.isRequired,
    })
  ).isRequired,
}
