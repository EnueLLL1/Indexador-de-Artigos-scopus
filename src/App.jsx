import { useState, useEffect, useRef } from 'react'
import Papa from 'papaparse'
import './App.css'
import { POR_PAGINA } from './constants'
import { parseCSVData } from './utils/csvParser'
import { enviarParaSupabase, carregarDoSupabase, limparDadosSupabase } from './utils/supabaseService'
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
import Dashboard from './components/Dashboard'

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [artigos, setArtigos] = useState([])
  const [autores, setAutores] = useState([])
  const [referencias, setReferencias] = useState([])
  const [keywords, setKeywords] = useState([])
  const [csvFile, setCsvFile] = useState(null)
  const [darkMode, setDarkMode] = useDarkMode(false)
  const [enviandoParaSupabase, setEnviandoParaSupabase] = useState(false)
  const [carregandoDoSupabase, setCarregandoDoSupabase] = useState(false)
  const [mensagemSupabase, setMensagemSupabase] = useState(null)
  const [dadosDoBanco, setDadosDoBanco] = useState(false)

  const [busca, setBusca] = useState('')
  const [filtroAno, setFiltroAno] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  const csvInputRef = useRef(null)

  const tiposUnicos = [
    ...new Set(artigos.map(a => a.tipo).filter(Boolean)),
  ].sort()

  async function handleCarregarDoBanco() {
    setCarregandoDoSupabase(true)
    setMensagemSupabase(null)
    
    const resultado = await carregarDoSupabase()
    
    if (resultado.sucesso && resultado.dados) {
      setArtigos(resultado.dados.artigos)
      // Extrai autores e keywords dos artigos
      const todosAutores = new Set()
      const todasKeywords = new Set()
      resultado.dados.artigos.forEach(artigo => {
        artigo.autores?.forEach(autor => todosAutores.add(autor.nome))
        artigo.keywords?.forEach(kw => todasKeywords.add(kw.nome))
      })
      setAutores(Array.from(todosAutores).map(nome => ({ nome })))
      setKeywords(Array.from(todasKeywords).map(nome => ({ nome })))
      setDadosDoBanco(true)
      setActiveTab('overview')
    }
    
    setMensagemSupabase(resultado.mensagem)
    setCarregandoDoSupabase(false)
    
    if (!resultado.sucesso) {
      alert('Erro ao carregar do Supabase: ' + resultado.mensagem)
    }
  }

  function handleLimparDados() {
    const dadosLimpos = limparDadosSupabase()
    setArtigos(dadosLimpos.artigos)
    setAutores(dadosLimpos.autores)
    setReferencias(dadosLimpos.referencias)
    setKeywords(dadosLimpos.keywords)
    setDadosDoBanco(false)
    setBusca('')
    setFiltroAno('')
    setFiltroTipo('')
    setActiveTab('overview')
  }

  async function handleCarregar() {
    if (!csvFile) {
      alert('Selecione um CSV')
      return
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const { artigos: novosArtigos, autores: novosAutores, referencias: novasReferencias, keywords: novosKeywords, isbns, openAccess } = parseCSVData(results.data)

        setArtigos(novosArtigos)
        setAutores(novosAutores)
        setReferencias(novasReferencias)
        setKeywords(novosKeywords)
        setBusca('')
        setFiltroAno('')
        setFiltroTipo('')
        setCsvFile(null)
        if (csvInputRef.current) {
          csvInputRef.current.value = ''
        }

        // Envia para o Supabase
        setEnviandoParaSupabase(true)
        setMensagemSupabase(null)
        const resultado = await enviarParaSupabase(novosArtigos, novosAutores, novasReferencias, novosKeywords, isbns, openAccess)
        setMensagemSupabase(resultado.mensagem)
        setEnviandoParaSupabase(false)
        
        if (!resultado.sucesso) {
          alert('Erro ao enviar para Supabase: ' + resultado.mensagem)
        }
      },
    })
  }

  const anosUnicos = [
    ...new Set(artigos.map(a => a.ano).filter(Boolean)),
  ].sort()

  function dadosFiltrados() {
    const termo = busca.toLowerCase()

    if (activeTab === 'artigos') {
      return artigos.filter(a => {
        const bateAno = filtroAno ? a.ano === filtroAno : true
        const bateTipo = filtroTipo ? a.tipo === filtroTipo : true
        const bateBusca = termo
          ? (a.titulo || '').toLowerCase().includes(termo) ||
            (a.doi || '').toLowerCase().includes(termo) ||
            (a.ano || '').toLowerCase().includes(termo) ||
            (a.autores || '').toLowerCase().includes(termo)
          : true
        return bateAno && bateTipo && bateBusca
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
  }, [busca, filtroAno, filtroTipo, activeTab])

  return (
    <div className="container">
      <div className="app-header">
        <div>
          <div className="app-title">Scopus Research Dashboard</div>
          <div className="app-subtitle">
            Importação e visualização de dados Scopus
          </div>
        </div>
        <div className="header-actions">
          {dadosDoBanco && (
            <span className="badge-live">Supabase · {artigos.length} docs</span>
          )}
          <button 
            className="btn-action btn-load" 
            onClick={handleCarregarDoBanco}
            disabled={carregandoDoSupabase}
          >
            {carregandoDoSupabase ? '⏳ Carregando...' : '↓ Carregar do Banco'}
          </button>
          <button 
            className="btn-action" 
            onClick={handleLimparDados}
            disabled={!dadosDoBanco}
          >
            ✕ Limpar
          </button>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️ Dia' : '🌙 Noite'}
          </button>
        </div>
      </div>

      {/* Dashboard - Visão Geral */}
      {activeTab === 'overview' && (
        <Dashboard 
          artigos={artigos}
          autores={autores}
          keywords={keywords}
          dadosDoBanco={dadosDoBanco}
          aoCarregarDoBanco={handleCarregarDoBanco}
          aoLimparDados={handleLimparDados}
        />
      )}

      {/* Tabs de navegação para tabelas */}
      {activeTab !== 'overview' && (
        <>
          <div className="toolbar">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={e => setCsvFile(e.target.files[0])}
            />
            <button 
              className="btn-primary" 
              onClick={handleCarregar}
              disabled={enviandoParaSupabase}
            >
              {enviandoParaSupabase ? 'Enviando...' : 'Carregar CSV'}
            </button>
          </div>

          {mensagemSupabase && (
            <div className={`mensagem-supabase ${mensagemSupabase.includes('sucesso') ? 'sucesso' : 'erro'}`}>
              {mensagemSupabase}
            </div>
          )}

          <div className="filtros">
            <input
              className="input-busca"
              type="text"
              placeholder="Buscar por título, autor ou DOI…"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <select
              className="select-filtro"
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              disabled={activeTab !== 'artigos'}
            >
              <option value="">Todos os tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <select
              className="select-filtro"
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
        </>
      )}
    </div>
  )
}
