import { useState } from 'react';
import Papa from 'papaparse';
import './App.css';

const TABS = [
  { id: 'artigos', label: 'Artigos' },
  { id: 'autores', label: 'Autores' },
  { id: 'referencias', label: 'Referências' },
  { id: 'keywords', label: 'Palavra-Chave' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('artigos');
  const [artigos, setArtigos] = useState([]);
  const [autores, setAutores] = useState([]);
  const [referencias, setReferencias] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [csvFile, setCsvFile] = useState(null);

  function handleCarregar() {
    if (!csvFile) { alert('Selecione um CSV'); return; }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const novosArtigos = [];
        const novosAutores = [];
        const novasReferencias = [];
        const novosKeywords = [];

        results.data.forEach((item, index) => {
          const id = index + 1;

          if (item.Titulo || item.Ano || item.DOI) {
            novosArtigos.push({ id, titulo: item.Titulo, ano: item.Ano, doi: item.DOI });
          }

          if (item.Autor) {
            novosAutores.push({ id, nome: item.Autor });
          }

          if (item.Referencia) {
            novasReferencias.push({ id, nome: item.Referencia });
          }

          if (item.PalavraChave) {
            novosKeywords.push({ id, nome: item.PalavraChave });
          }
        });

        setArtigos(novosArtigos);
        setAutores(novosAutores);
        setReferencias(novasReferencias);
        setKeywords(novosKeywords);
      },
    });
  }

  function handleLimpar() {
    setArtigos([]);
    setAutores([]);
    setReferencias([]);
    setKeywords([]);
    setCsvFile(null);
    document.getElementById('csvFile').value = '';
  }

  return (
    <div className="container">
      <h1>Gerenciador de Artigos</h1>

      <div className="top-buttons">
        <input
          id="csvFile"
          type="file"
          accept=".csv"
          onChange={e => setCsvFile(e.target.files[0])}
        />
        <button onClick={handleCarregar}>Carregar Dados</button>
        <button onClick={handleLimpar}>Limpar Dados</button>
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

      {activeTab === 'artigos' && (
        <table>
          <thead><tr><th>ID</th><th>Título</th><th>Ano</th><th>DOI</th></tr></thead>
          <tbody>
            {artigos.map((a, i) => (
              <tr key={i}>
                <td>{a.id}</td><td>{a.titulo}</td><td>{a.ano}</td><td>{a.doi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 'autores' && (
        <table>
          <thead><tr><th>ID</th><th>Nome</th></tr></thead>
          <tbody>
            {autores.map((a, i) => (
              <tr key={i}><td>{a.id}</td><td>{a.nome}</td></tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 'referencias' && (
        <table>
          <thead><tr><th>ID</th><th>Referência</th></tr></thead>
          <tbody>
            {referencias.map((r, i) => (
              <tr key={i}><td>{r.id}</td><td>{r.nome}</td></tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 'keywords' && (
        <table>
          <thead><tr><th>ID</th><th>Palavra-Chave</th></tr></thead>
          <tbody>
            {keywords.map((k, i) => (
              <tr key={i}><td>{k.id}</td><td>{k.nome}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}