import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import PropTypes from 'prop-types'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default function Dashboard({ artigos, dadosDoBanco, aoCarregarDoBanco, aoLimparDados }) {
  const [metricas, setMetricas] = useState({
    totalDocumentos: 0,
    autoresUnicos: 0,
    periodicos: 0,
    openAccess: 0,
    maisCitado: 0,
    anoMin: 0,
    anoMax: 0,
  })

  const [dadosGraficos, setDadosGraficos] = useState({
    porAno: {},
    porTipo: {},
    porIdioma: {},
    topKeywords: [],
    topAutores: [],
    topPeriodicos: [],
  })

  useEffect(() => {
    if (!artigos || artigos.length === 0) return

    const porAno = {}
    const porTipo = {}
    const porIdioma = {}
    const keywordCounts = {}
    const autorCounts = {}
    const periodicoCounts = {}
    let openAccessCount = 0
    let maxCitacoes = 0
    const anos = []
    const autoresSet = new Set()

    artigos.forEach(artigo => {
      // Ano
      if (artigo.ano) {
        porAno[artigo.ano] = (porAno[artigo.ano] || 0) + 1
        anos.push(artigo.ano)
      }

      // Tipo
      if (artigo.tipo) {
        porTipo[artigo.tipo] = (porTipo[artigo.tipo] || 0) + 1
      }

      // Idioma
      if (artigo.linguagem) {
        porIdioma[artigo.linguagem] = (porIdioma[artigo.linguagem] || 0) + 1
      }

      // Keywords
      if (artigo.keywords && artigo.keywords.length > 0) {
        artigo.keywords.forEach(kw => {
          keywordCounts[kw.nome] = (keywordCounts[kw.nome] || 0) + 1
        })
      }

      // Autores
      if (artigo.autores && artigo.autores.length > 0) {
        artigo.autores.forEach(autor => {
          autorCounts[autor.nome] = (autorCounts[autor.nome] || 0) + 1
          autoresSet.add(autor.nome)
        })
      }

      // Periódicos
      if (artigo.source_title) {
        periodicoCounts[artigo.source_title] = (periodicoCounts[artigo.source_title] || 0) + 1
      }

      // Open Access
      if (artigo.open_access && artigo.open_access.trim()) {
        openAccessCount++
      }

      // Mais citado
      if (artigo.cited_by > maxCitacoes) {
        maxCitacoes = artigo.cited_by
      }
    })

    const anoMin = anos.length > 0 ? Math.min(...anos) : 0
    const anoMax = anos.length > 0 ? Math.max(...anos) : 0

    setMetricas({
      totalDocumentos: artigos.length,
      autoresUnicos: autoresSet.size,
      periodicos: Object.keys(periodicoCounts).length,
      openAccess: openAccessCount,
      maisCitado: maxCitacoes,
      anoMin,
      anoMax,
    })

    setDadosGraficos({
      porAno: Object.fromEntries(Object.entries(porAno).sort((a, b) => a[0] - b[0])),
      porTipo: Object.fromEntries(Object.entries(porTipo).sort((a, b) => b[1] - a[1])),
      porIdioma: Object.fromEntries(Object.entries(porIdioma).sort((a, b) => b[1] - a[1])),
      topKeywords: Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]).slice(0, 60).map(([kw, n]) => ({ kw, n })),
      topAutores: Object.entries(autorCounts).sort((a, b) => b[1] - a[1]).slice(0, 100).map(([nome, n]) => ({ nome, n })),
      topPeriodicos: Object.entries(periodicoCounts).sort((a, b) => b[1] - a[1]).slice(0, 50).map(([src, n]) => ({ src, n })),
    })
  }, [artigos])

  const cores = {
    roxo: '#533ab7',
    verde: '#0f6e56',
    coral: '#d85a30',
    âmbar: '#ba7517',
    azul: '#185fa5',
    cinza: '#888780',
  }

  const dadosGraficoAno = {
    labels: Object.keys(dadosGraficos.porAno).filter(ano => ano >= 2011),
    datasets: [{
      data: Object.keys(dadosGraficos.porAno).filter(ano => ano >= 2011).map(ano => dadosGraficos.porAno[ano]),
      backgroundColor: cores.roxo + 'cc',
      borderColor: cores.roxo,
      borderWidth: 1,
      borderRadius: 3,
    }],
  }

  const dadosGraficoTipo = {
    labels: Object.keys(dadosGraficos.porTipo),
    datasets: [{
      data: Object.values(dadosGraficos.porTipo),
      backgroundColor: [cores.roxo, cores.verde, cores.coral, cores.âmbar, cores.azul, cores.cinza, '#d4537e', '#639922'],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  }

  const opcoesGraficoBarra = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 45 } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
    },
  }

  const opcoesGraficoDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
    },
  }

  const renderBarras = (dados, total, cor = cores.roxo) => {
    if (!dados || dados.length === 0) return null
    const max = dados[0]?.n || 1
    return (
      <div className="bar-gauge-container">
        {dados.slice(0, 10).map((item, idx) => (
          <div key={idx} className="bar-row">
            <div className="bar-label">
              <span>{item.label || item.kw || item.nome || item.src}</span>
              <span>{item.n.toLocaleString('pt-BR')} {total ? `(${Math.round(item.n / total * 100)}%)` : ''}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${Math.round(item.n / max * 100)}%`, backgroundColor: cor }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="section-header">
        <h2>Visão Geral</h2>
        <p>Panorama da base de dados exportada do Scopus</p>
      </div>

      {/* Métricas */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Documentos</div>
          <div className="metric-value">{metricas.totalDocumentos.toLocaleString('pt-BR')}</div>
          <div className="metric-sub">{metricas.anoMin} – {metricas.anoMax}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Autores únicos</div>
          <div className="metric-value">{metricas.autoresUnicos.toLocaleString('pt-BR')}</div>
          <div className="metric-sub">com ID Scopus</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Periódicos/Anais</div>
          <div className="metric-value">{metricas.periodicos.toLocaleString('pt-BR')}</div>
          <div className="metric-sub">veículos distintos</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Open Access</div>
          <div className="metric-value">{metricas.openAccess.toLocaleString('pt-BR')}</div>
          <div className="metric-sub">{metricas.totalDocumentos > 0 ? `${Math.round(metricas.openAccess / metricas.totalDocumentos * 100)}% do total` : '0%'}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Mais citado</div>
          <div className="metric-value">{metricas.maisCitado.toLocaleString('pt-BR')}</div>
          <div className="metric-sub">citações</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Publicações por ano</div>
          <div className="chart-wrap">
            {Object.keys(dadosGraficos.porAno).length > 0 && (
              <Bar data={dadosGraficoAno} options={opcoesGraficoBarra} />
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Tipo de documento</div>
          <div className="chart-wrap">
            {Object.keys(dadosGraficos.porTipo).length > 0 && (
              <Doughnut data={dadosGraficoTipo} options={opcoesGraficoDoughnut} />
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Idiomas</div>
          {renderBarras(Object.entries(dadosGraficos.porIdioma).map(([label, n]) => ({ label, n })), metricas.totalDocumentos, cores.verde)}
        </div>
        <div className="card">
          <div className="card-title">Top 10 palavras-chave dos autores</div>
          {renderBarras(dadosGraficos.topKeywords.slice(0, 10), null, cores.roxo)}
        </div>
      </div>

      {/* Ações do Banco */}
      <div className="card">
        <div className="card-title">Dados</div>
        <div className="data-actions">
          <button 
            className="btn-action btn-load" 
            onClick={aoCarregarDoBanco}
          >
            ↓ Carregar do Banco
          </button>
          <button 
            className="btn-action" 
            onClick={aoLimparDados}
            disabled={!dadosDoBanco}
          >
            ✕ Limpar Dados
          </button>
          {dadosDoBanco && (
            <span className="badge-live">Supabase · {metricas.totalDocumentos} docs</span>
          )}
        </div>
      </div>
    </div>
  )
}

Dashboard.propTypes = {
  artigos: PropTypes.arrayOf(PropTypes.object).isRequired,
  dadosDoBanco: PropTypes.bool.isRequired,
  aoCarregarDoBanco: PropTypes.func.isRequired,
  aoLimparDados: PropTypes.func.isRequired,
}
