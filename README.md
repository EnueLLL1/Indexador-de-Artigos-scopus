# Gerenciador de Artigos Científicos

Aplicação React para importação, visualização e gerenciamento de dados de artigos científicos no formato CSV (padrão Scopus), com integração automática ao banco de dados Supabase.

## Funcionalidades

- 📤 **Importação de CSV**: Carregue arquivos CSV com dados de artigos científicos
- 💾 **Sincronização com Supabase**: Os dados são automaticamente enviados para o banco de dados no Supabase
- 🔍 **Busca e Filtros**: Busque por título, DOI, ano e filtre por ano de publicação
- 📊 **Visualização em Abas**:
  - Artigos (com detalhes completos)
  - Autores
  - Referências
  - Palavras-chave
- 🌙 **Modo Escuro/Claro**: Alternância entre temas
- 📄 **Paginação**: Navegação por páginas dos resultados

## Schema do Banco de Dados

A aplicação segue o seguinte schema no Supabase:

### Tabelas Principais
- `autor` - Autores dos artigos
- `artigo` - Artigos científicos com todos os metadados
- `palavra_chave` - Palavras-chave dos artigos
- `index_keyword` - Keywords de indexação
- `references_table` - Referências bibliográficas
- `isbn` - ISBNs de livros
- `open_access` - Tipos de acesso aberto

### Tabelas Relacionais
- `artigo_autor` - Relação muitos-para-muitos entre artigos e autores
- `artigo_palavrachave` - Relação entre artigos e palavras-chave
- `artigo_indexkeyword` - Relação entre artigos e index keywords
- `artigo_references` - Relação entre artigos e referências
- `artigo_isbn` - Relação entre artigos e ISBNs
- `artigo_openaccess` - Relação entre artigos e open access

## Instalação

1. Clone este repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas credenciais do Supabase:
   ```
   VITE_SUPABASE_URL="sua_url_do_supabase"
   VITE_SUPABASE_ANON_KEY="sua_chave_anon_do_supabase"
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Uso

1. **Carregar CSV**: Selecione um arquivo CSV no padrão Scopus
2. **Processamento Automático**: Ao carregar, os dados são:
   - Parseados e exibidos na interface
   - Enviados automaticamente para o banco de dados Supabase
3. **Visualizar Dados**: Navegue pelas abas para ver artigos, autores, referências e keywords
4. **Buscar e Filtrar**: Use a barra de busca e o filtro de ano para encontrar dados específicos

## Formato do CSV

O CSV deve conter as seguintes colunas (padrão Scopus):
- Title
- Year
- DOI
- Authors (separados por ;)
- Author Keywords (separadas por ;)
- References (separadas por ;)
- Source Title
- Cited by
- Link
- Abstract
- ISSN
- CODEN
- Language
- Type
- Source
- ISBN
- Open Access

## Build

Para gerar uma build de produção:

```bash
npm run build
```

## Tecnologias

- React 18
- Vite
- PapaParse (parsing de CSV)
- Supabase (banco de dados)
- CSS puro (sem frameworks)

## Licença

MIT

