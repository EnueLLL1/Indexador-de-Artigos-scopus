import PropTypes from 'prop-types'
import { Referencia } from './Referencia'

export function TabelaReferencias({ dados }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Referências</th>
        </tr>
      </thead>
      <tbody>
        {dados.map(r => (
          <tr key={r.id}>
            <td>{r.id}</td>
            <td>
              <Referencia texto={r.nome} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

TabelaReferencias.propTypes = {
  dados: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nome: PropTypes.string.isRequired,
    })
  ).isRequired,
}
