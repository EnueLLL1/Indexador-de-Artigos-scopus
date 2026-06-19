import PropTypes from 'prop-types'

export function Paginacao({ pagina, totalPaginas, onPrevious, onNext }) {
  if (totalPaginas <= 1) return null

  return (
    <div className="paginacao">
      <button onClick={onPrevious} disabled={pagina === 1}>
        ← Anterior
      </button>
      <span className="pagina-info">
        Página {pagina} de {totalPaginas}
      </span>
      <button onClick={onNext} disabled={pagina === totalPaginas}>
        Próxima →
      </button>
    </div>
  )
}

Paginacao.propTypes = {
  pagina: PropTypes.number.isRequired,
  totalPaginas: PropTypes.number.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
}
