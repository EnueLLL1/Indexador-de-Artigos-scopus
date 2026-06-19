-- Script SQL para adicionar restrições UNIQUE nas tabelas do Supabase
-- Execute este script no SQL Editor do painel do Supabase

-- Adiciona restrição UNIQUE na tabela palavra_chave
ALTER TABLE public.palavra_chave
ADD CONSTRAINT IF NOT EXISTS palavra_chave_nome_key UNIQUE (nome);

-- Adiciona restrição UNIQUE na tabela index_keyword
ALTER TABLE public.index_keyword
ADD CONSTRAINT IF NOT EXISTS index_keyword_nome_key UNIQUE (nome);

-- Adiciona restrição UNIQUE na tabela references_table
ALTER TABLE public.references_table
ADD CONSTRAINT IF NOT EXISTS references_table_nome_key UNIQUE (nome);

-- Adiciona restrição UNIQUE na tabela isbn
ALTER TABLE public.isbn
ADD CONSTRAINT IF NOT EXISTS isbn_valor_key UNIQUE (valor);

-- Adiciona restrição UNIQUE na tabela open_access
ALTER TABLE public.open_access
ADD CONSTRAINT IF NOT EXISTS open_access_tipo_key UNIQUE (tipo);

-- A tabela autor já deve ter a restrição UNIQUE no campo nome (conforme schema)
-- Se não tiver, execute:
-- ALTER TABLE public.autor ADD CONSTRAINT IF NOT EXISTS autor_nome_key UNIQUE (nome);

-- Verifica as restrições adicionadas
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'UNIQUE'
  AND tc.table_name IN ('autor', 'palavra_chave', 'index_keyword', 'references_table', 'isbn', 'open_access')
ORDER BY tc.table_name;
