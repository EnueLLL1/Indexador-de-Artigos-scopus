import { useState, useEffect, useRef } from 'react'
import Papa from 'papaparse'
import PropTypes from 'prop-types'
import './App.css'

const TABS = [
  { id: 'artigos', label: 'Artigos' },
  { id: 'autores', label: 'Autores' },
  { id: 'referencias', label: 'Referências' },
  { id: 'keywords', label: 'Palavras-chave' },
]

const POR_PAGINA = 10

function Referencia({ texto }) {
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

export default function App() {
  const [activeTab, setActiveTab] = useState('artigos')
  const [artigos, setArtigos] = useState([])
  const [autores, setAutores] = useState([])
  const [referencias, setReferencias] = useState([])
  const [keywords, setKeywords] = useState([])
  const [csvFile, setCsvFile] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  const [busca, setBusca] = useState('')
  const [filtroAno, setFiltroAno] = useState('')
  const [pagina, setPagina] = useState(1)

  const csvInputRef = useRef(null)

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    setPagina(1)
  }, [busca, filtroAno, activeTab])

  function handleCarregar() {
    if (!csvFile) {
      alert('Selecione um CSV')
      return
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const novosArtigos = []
        const novosAutores = []
        const novasReferencias = []
        const novosKeywords = []
        let autorId = 1,
          referenciaId = 1,
          keywordId = 1

        results.data.forEach((item, index) => {
          const artigoId = index + 1
          if (item['Title'] || item['Year'] || item['DOI']) {
            novosArtigos.push({
              id: artigoId,
              titulo: item['Title'],
              ano: item['Year'],
              doi: item['DOI'],
            })
          }
          if (item['Authors']) {
            novosAutores.push({ id: autorId++, nome: item['Authors'] })
          }
          if (item['References']) {
            novasReferencias.push({
              id: referenciaId++,
              nome: item['References'],
            })
          }
          if (item['Author Keywords']) {
            novosKeywords.push({
              id: keywordId++,
              nome: item['Author Keywords'],
            })
          }
        })

        setArtigos(novosArtigos)
        setAutores(novosAutores)
        setReferencias(novasReferencias)
        setKeywords(novosKeywords)
        setBusca('')
        setFiltroAno('')
        setPagina(1)
      },
    })
  }

  function handleLimpar() {
    setArtigos([])
    setAutores([])
    setReferencias([])
    setKeywords([])
    setCsvFile(null)
    setBusca('')
    setFiltroAno('')
    setPagina(1)
    csvInputRef.current.value = ''
  }

  // anos únicos extraídos dos artigos para o select
  const anosUnicos = [
    ...new Set(artigos.map(a => a.ano).filter(Boolean)),
  ].sort()

  // dados da aba ativa com filtros aplicados
  function dadosFiltrados() {
    const termo = busca.toLowerCase()

    if (activeTab === 'artigos') {
      return artigos.filter(a => {
        const bateAno = filtroAno ? a.ano === filtroAno : true
        const bateBusca = termo
          ? (a.titulo || '').toLowerCase().includes(termo) ||
            (a.doi || '').toLowerCase().includes(termo) ||
            (a.ano || '').toLowerCase().includes(termo)
          : true
        return bateAno && bateBusca
      })
    }

    if (activeTab === 'autores') {
      return autores.filter(a =>
        termo ? (a.nome || '').toLowerCase().includes(termo) : true
      )
    }

    if (activeTab === 'referencias') {
      return referencias.filter(r =>
        termo ? (r.nome || '').toLowerCase().includes(termo) : true
      )
    }

    if (activeTab === 'keywords') {
      return keywords.filter(k =>
        termo ? (k.nome || '').toLowerCase().includes(termo) : true
      )
    }

    return []
  }

  const dados = dadosFiltrados()
  const totalPaginas = Math.ceil(dados.length / POR_PAGINA)
  const inicio = (pagina - 1) * POR_PAGINA
  const dadosPagina = dados.slice(inicio, inicio + POR_PAGINA)

  return (
    <div className="container">
      <div className="app-header">
        <div>
          <div className="app-title">Gerenciador de Artigos</div>
          <div className="app-subtitle">
            Importação e visualização de dados Scopus
          </div>
        </div>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Modo Dia' : '🌙 Modo Noite'}
        </button>
      </div>

      <div className="toolbar">
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv"
          onChange={e => setCsvFile(e.target.files[0])}
        />
        <button className="btn-primary" onClick={handleCarregar}>
          Carregar Dados
        </button>
        <button onClick={handleLimpar}>Limpar Dados</button>
      </div>

      <div className="filtros">
        <input
          className="input-busca"
          type="text"
          placeholder="Buscar..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <select
          className="select-ano"
          value={filtroAno}
          onChange={e => setFiltroAno(e.target.value)}
          disabled={activeTab !== 'artigos'}
        >
          <option value="">Todos os anos</option>
          {anosUnicos.map(ano => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
        {dados.length > 0 && (
          <span className="contagem">
            {dados.length} resultado{dados.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={'tab-button' + (activeTab === tab.id ? ' active' : '')}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        {activeTab === 'artigos' && (
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
              {dadosPagina.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.titulo}</td>
                  <td>{a.ano}</td>
                  <td>{a.doi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === 'autores' && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Autores</th>
              </tr>
            </thead>
            <tbody>
              {dadosPagina.map(a => (
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
        )}

        {activeTab === 'referencias' && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Referências</th>
              </tr>
            </thead>
            <tbody>
              {dadosPagina.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <Referencia texto={r.nome} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'keywords' && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Palavras-chave</th>
              </tr>
            </thead>
            <tbody>
              {dadosPagina.map(k => (
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
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="paginacao">
          <button onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>
            ← Anterior
          </button>
          <span className="pagina-info">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            onClick={() => setPagina(p => p + 1)}
            disabled={pagina === totalPaginas}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}
