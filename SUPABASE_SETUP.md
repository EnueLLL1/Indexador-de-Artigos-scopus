# 📋 Instruções para Corrigir Erros do Supabase

## Problemas Identificados

1. **Erro `42P10` - ON CONFLICT sem constraint UNIQUE**: O código usava `upsert` com `onConflict`, mas as tabelas não tinham restrições UNIQUE configuradas no banco de dados.

2. **Erro CORS nas requisições**: Pode ocorrer se as chaves de API estiverem incorretas ou se o projeto não estiver configurado corretamente.

3. **Tabelas relacionais vazias**: As tabelas como `artigo_autor`, `artigo_palavrachave`, etc., estavam vazias porque as inserções das entidades principais falhavam.

## ✅ Solução Implementada

### 1. Código Atualizado (`supabaseService.js`)

O serviço foi reescrito para usar a estratégia **"buscar antes de inserir"** ao invés de `upsert`:

- Primeiro busca o registro pelo campo único (nome, valor, tipo)
- Se existir, usa o registro existente
- Se não existir (erro `PGRST116` = not found), faz o insert
- Isso elimina a necessidade da cláusula `ON CONFLICT`

### 2. Script SQL para Restrições UNIQUE

Execute o arquivo `supabase_constraints.sql` no **SQL Editor** do painel do Supabase:

```sql
-- Acesse: https://yzhraksjkqyyqjtmitxk.supabase.co/project/_/sql
-- Cole e execute todo o conteúdo do arquivo supabase_constraints.sql
```

Isso vai adicionar as constraints UNIQUE necessárias para evitar duplicatas no futuro.

### 3. Cliente Supabase Melhorado

O `supabaseClient.js` agora:
- Valida se as variáveis de ambiente estão configuradas
- Especifica explicitamente o schema `public`
- Loga erros de configuração no console

## 🚀 Próximos Passos

### Passo 1: Execute o Script SQL no Supabase

1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/yzhraksjkqyyqjtmitxk
2. Vá em **SQL Editor** (menu lateral)
3. Clique em **New query**
4. Copie e cole TODO o conteúdo do arquivo `supabase_constraints.sql`
5. Clique em **Run** (ou Ctrl+Enter)
6. Verifique se todas as constraints foram criadas (deve aparecer uma tabela com os resultados)

### Passo 2: Teste a Aplicação

1. Recarregue a página da aplicação React
2. Faça upload de um CSV
3. Observe o console do navegador:
   - ✅ Deve aparecer: `"Iniciando envio para Supabase..."`
   - ✅ Deve aparecer: `"Entidades inseridas: {...}"`
   - ✅ Deve aparecer: `"Inseridas X relações artigo_autor"`
   - ❌ Não deve aparecer mais erros de `ON CONFLICT` ou `42P10`

### Passo 3: Verifique no Banco de Dados

Após o upload, vá no **Table Editor** do Supabase e verifique se as tabelas foram populadas:

- `autor` - deve ter os autores únicos
- `artigo` - deve ter os artigos
- `palavra_chave` - deve ter as palavras-chave únicas
- `index_keyword` - deve ter as index keywords únicas
- `references_table` - deve ter as referências únicas
- `isbn` - deve ter os ISBNs únicos (se houver)
- `open_access` - deve ter os tipos de open access únicos (se houver)
- `artigo_autor` - deve ter as relações entre artigos e autores
- `artigo_palavrachave` - deve ter as relações entre artigos e palavras-chave
- `artigo_indexkeyword` - deve ter as relações entre artigos e index keywords
- `artigo_references` - deve ter as relações entre artigos e referências

## 🔍 Debug

Se ainda aparecerem erros, verifique:

### No Console do Navegador (F12)

```javascript
// Abra o console e digite:
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Key existe:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
```

### Variáveis de Ambiente

Certifique-se que o arquivo `.env` na raiz do projeto contém:

```env
VITE_SUPABASE_URL="https://yzhraksjkqyyqjtmitxk.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_oSh0LpDWfHE2rPKX7CncUA_YiFSyBMA"
```

### Políticas RLS (Row Level Security)

Se as inserções falharem com erro de permissão, pode ser necessário desabilitar o RLS ou criar políticas:

```sql
-- Desabilita RLS temporariamente para teste (NÃO faça isso em produção!)
ALTER TABLE public.autor DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artigo DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.palavra_chave DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.index_keyword DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.references_table DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.isbn DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_access DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artigo_autor DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artigo_palavrachave DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artigo_indexkeyword DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artigo_references DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artigo_isbn DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artigo_openaccess DISABLE ROW LEVEL SECURITY;
```

Ou crie políticas de inserção pública (apenas para desenvolvimento):

```sql
CREATE POLICY "Permitir inserção pública" ON public.autor
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir leitura pública" ON public.autor
FOR SELECT TO anon USING (true);

-- Repita para todas as tabelas...
```

## 📝 Resumo das Mudanças no Código

| Arquivo | Mudança |
|---------|---------|
| `src/utils/supabaseService.js` | Substituído `upsert` por padrão "buscar → se não existir, insert" |
| `src/supabaseClient.js` | Adicionada validação de variáveis de ambiente e schema explícito |
| `supabase_constraints.sql` | Criado script SQL para adicionar constraints UNIQUE |
| `SUPABASE_SETUP.md` | Este arquivo com instruções detalhadas |

## ⚠️ Importante

As constraints UNIQUE são **essenciais** para:
- Evitar dados duplicados no banco
- Garantir integridade dos relacionamentos
- Permitir que o código identifique registros existentes corretamente

**Não pule a execução do script SQL!**
