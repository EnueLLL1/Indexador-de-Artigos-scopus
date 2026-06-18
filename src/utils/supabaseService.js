import supabase from '../supabaseClient'

/**
 * Envia dados do CSV para o banco de dados no Supabase
 * Segue o schema: autor, artigo, palavra_chave, index_keyword, references_table, isbn, open_access
 * e tabelas relacionais artigo_autor, artigo_palavrachave, etc.
 */
export async function enviarParaSupabase(artigos, autores, referencias, keywords, isbns, openAccess) {
  try {
    // 1. Inserir autores (evitando duplicados pelo nome UNIQUE)
    const autoresInseridos = []
    for (const autor of autores) {
      if (!autor.nome) continue
      
      const { data, error } = await supabase
        .from('autor')
        .upsert({ nome: autor.nome }, { onConflict: 'nome' })
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao inserir autor:', error)
      } else {
        autoresInseridos.push(data)
      }
    }

    // 2. Inserir artigos
    const artigosInseridos = []
    for (const artigo of artigos) {
      if (!artigo.titulo) continue
      
      const { data, error } = await supabase
        .from('artigo')
        .insert({
          titulo: artigo.titulo,
          ano: artigo.ano || null,
          source_title: artigo.source_title || null,
          cited_by: artigo.cited_by || null,
          link: artigo.link || null,
          doi: artigo.doi || null,
          resumo: artigo.resumo || null,
          issn: artigo.issn || null,
          coden: artigo.coden || null,
          linguagem: artigo.linguagem || null,
          tipo: artigo.tipo || null,
          source: artigo.source || null,
          isbn: artigo.isbn || null,
        })
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao inserir artigo:', error)
      } else {
        artigosInseridos.push(data)
      }
    }

    // 3. Inserir palavras-chave
    const keywordsInseridas = []
    for (const keyword of keywords) {
      if (!keyword.nome) continue
      
      const { data, error } = await supabase
        .from('palavra_chave')
        .upsert({ nome: keyword.nome }, { onConflict: 'nome' })
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao inserir palavra-chave:', error)
      } else {
        keywordsInseridas.push(data)
      }
    }

    // 4. Inserir index keywords
    const indexKeywordsInseridas = []
    for (const indexKeyword of keywords) {
      if (!indexKeyword.nome) continue
      
      const { data, error } = await supabase
        .from('index_keyword')
        .upsert({ nome: indexKeyword.nome }, { onConflict: 'nome' })
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao inserir index keyword:', error)
      } else {
        indexKeywordsInseridas.push(data)
      }
    }

    // 5. Inserir referências
    const referenciasInseridas = []
    for (const referencia of referencias) {
      if (!referencia.nome) continue
      
      const { data, error } = await supabase
        .from('references_table')
        .upsert({ nome: referencia.nome }, { onConflict: 'nome' })
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao inserir referência:', error)
      } else {
        referenciasInseridas.push(data)
      }
    }

    // 6. Inserir ISBNs (se houver)
    const isbnsInseridos = []
    if (isbns && isbns.length > 0) {
      for (const isbn of isbns) {
        if (!isbn.valor) continue
        
        const { data, error } = await supabase
          .from('isbn')
          .upsert({ valor: isbn.valor }, { onConflict: 'valor' })
          .select()
          .single()
        
        if (error) {
          console.error('Erro ao inserir ISBN:', error)
        } else {
          isbnsInseridos.push(data)
        }
      }
    }

    // 7. Inserir Open Access (se houver)
    const openAccessInseridos = []
    if (openAccess && openAccess.length > 0) {
      for (const oa of openAccess) {
        if (!oa.tipo) continue
        
        const { data, error } = await supabase
          .from('open_access')
          .upsert({ tipo: oa.tipo }, { onConflict: 'tipo' })
          .select()
          .single()
        
        if (error) {
          console.error('Erro ao inserir open access:', error)
        } else {
          openAccessInseridos.push(data)
        }
      }
    }

    // 8. Inserir relações artigo_autor (em lote)
    const artigoAutorRelations = []
    for (const artigo of artigosInseridos) {
      const autoresDoArtigo = autores.filter(a => a.artigoId === artigo.id_artigo)
      for (const autorOriginal of autoresDoArtigo) {
        const autorNoBanco = autoresInseridos.find(a => a.nome === autorOriginal.nome)
        if (autorNoBanco) {
          artigoAutorRelations.push({
            id_artigo: artigo.id_artigo,
            id_autor: autorNoBanco.autor_id,
          })
        }
      }
    }
    
    if (artigoAutorRelations.length > 0) {
      await supabase.from('artigo_autor').insert(artigoAutorRelations)
    }

    // 9. Inserir relações artigo_palavrachave (em lote)
    const artigoPalavraChaveRelations = []
    for (const artigo of artigosInseridos) {
      const keywordsDoArtigo = keywords.filter(k => k.artigoId === artigo.id_artigo)
      for (const keywordOriginal of keywordsDoArtigo) {
        const keywordNoBanco = keywordsInseridas.find(k => k.nome === keywordOriginal.nome)
        if (keywordNoBanco) {
          artigoPalavraChaveRelations.push({
            id_artigo: artigo.id_artigo,
            id_palavrachave: keywordNoBanco.id,
          })
        }
      }
    }
    
    if (artigoPalavraChaveRelations.length > 0) {
      await supabase.from('artigo_palavrachave').insert(artigoPalavraChaveRelations)
    }

    // 10. Inserir relações artigo_indexkeyword (em lote)
    const artigoIndexKeywordRelations = []
    for (const artigo of artigosInseridos) {
      const indexKeywordsDoArtigo = keywords.filter(k => k.artigoId === artigo.id_artigo)
      for (const indexKeywordOriginal of indexKeywordsDoArtigo) {
        const indexKeywordNoBanco = indexKeywordsInseridas.find(k => k.nome === indexKeywordOriginal.nome)
        if (indexKeywordNoBanco) {
          artigoIndexKeywordRelations.push({
            id_artigo: artigo.id_artigo,
            id_indexkeyword: indexKeywordNoBanco.id,
          })
        }
      }
    }
    
    if (artigoIndexKeywordRelations.length > 0) {
      await supabase.from('artigo_indexkeyword').insert(artigoIndexKeywordRelations)
    }

    // 11. Inserir relações artigo_references (em lote)
    const artigoReferencesRelations = []
    for (const artigo of artigosInseridos) {
      const referenciasDoArtigo = referencias.filter(r => r.artigoId === artigo.id_artigo)
      for (const referenciaOriginal of referenciasDoArtigo) {
        const referenciaNoBanco = referenciasInseridas.find(r => r.nome === referenciaOriginal.nome)
        if (referenciaNoBanco) {
          artigoReferencesRelations.push({
            id_artigo: artigo.id_artigo,
            id_reference: referenciaNoBanco.id,
          })
        }
      }
    }
    
    if (artigoReferencesRelations.length > 0) {
      await supabase.from('artigo_references').insert(artigoReferencesRelations)
    }

    return {
      sucesso: true,
      mensagem: `Dados enviados com sucesso! ${artigosInseridos.length} artigos, ${autoresInseridos.length} autores, ${keywordsInseridas.length} palavras-chave, ${referenciasInseridas.length} referências.`,
    }
  } catch (erro) {
    console.error('Erro ao enviar para Supabase:', erro)
    return {
      sucesso: false,
      mensagem: `Erro ao enviar dados: ${erro.message}`,
    }
  }
}
