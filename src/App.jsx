import { useState, useEffect, useRef } from 'react'
import Papa from 'papaparse'
import './App.css'
import { POR_PAGINA } from './constants'
import { parseCSVData } from './utils/csvParser'
import { useDarkMode } from './hooks/useDarkMode'
import { usePagination } from './hooks/usePagination'
import {
  Tabs,
  Paginacao,
  TabelaArtigos,
  TabelaAutores,
  TabelaReferencias,
  TabelaKeywords,
} from './components'

export default function App() {
  const [activeTab, setActiveTab] = useState('artigos')
  const [artigos, setArtigos] = useState([])
  const [autores, setAutores] = useState([])
  const [referencias, setReferencias] = useState([])
  const [keywords, setKeywords] = useState([])
  const [csvFile, setCsvFile] = useState(null)
  const [darkMode, setDarkMode] = useDarkMode(false)

  const [busca, setBusca] = useState('')
  const [filtroAno, setFiltroAno] = useState('')

  const csvInputRef = useRef(null)

  function handleCarregar() {
    if (!csvFile) {
      alert('Selecione um CSV')
      return
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const { artigos: novosArtigos, autores: novosAutores, referencias: novasReferencias, keywords: novosKeywords } = parseCSVData(results.data)

        setArtigos(novosArtigos)
        setAutores(novosAutores)
        setReferencias(novasReferencias)
        setKeywords(novosKeywords)
        setBusca('')
        setFiltroAno('')
        setCsvFile(null)
        if (csvInputRef.current) {
          csvInputRef.current.value = ''
        }
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
    if (csvInputRef.current) {
      csvInputRef.current.value = ''
    }
  }

  const anosUnicos = [
    ...new Set(artigos.map(a => a.ano).filter(Boolean)),
  ].sort()

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
  const { pagina, setPagina, totalPaginas, dadosPagina } = usePagination(dados, POR_PAGINA)

  useEffect(() => {
    setPagina(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, filtroAno, activeTab])

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

      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="table-wrap">
        {activeTab === 'artigos' && <TabelaArtigos dados={dadosPagina} />}
        {activeTab === 'autores' && <TabelaAutores dados={dadosPagina} />}
        {activeTab === 'referencias' && <TabelaReferencias dados={dadosPagina} />}
        {activeTab === 'keywords' && <TabelaKeywords dados={dadosPagina} />}
      </div>

      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        onPrevious={() => setPagina(p => p - 1)}
        onNext={() => setPagina(p => p + 1)}
      />
    </div>
  )
}
