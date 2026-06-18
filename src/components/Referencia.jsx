import { useState } from 'react'
import PropTypes from 'prop-types'

export function Referencia({ texto }) {
  const [expandido, setExpandido] = useState(false)
  const limite = 180

  if (!texto || texto.length <= limite) {
    return <span>{texto}</span>
  }

  return (
    <span>
      {expandido ? texto : texto.slice(0, limite) + '…'}
      <button className="btn-expandir" onClick={() => setExpandido(!expandido)}>
        {expandido ? ' ver menos' : ' ver mais'}
      </button>
    </span>
  )
}

Referencia.propTypes = {
  texto: PropTypes.string,
}
