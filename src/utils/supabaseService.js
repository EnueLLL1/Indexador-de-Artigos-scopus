import supabase from '../supabaseClient'

/**
 * Envia dados do CSV para o banco de dados no Supabase
 * Segue o schema: autor, artigo, palavra_chave, index_keyword, references_table, isbn, open_access
 * e tabelas relacionais artigo_autor, artigo_palavrachave, etc.
 */
export async function enviarParaSupabase(artigos, autores, referencias, keywords, isbns, openAccess) {
  try {
    console.log('Iniciando envio para Supabase...', {
      totalArtigos: artigos.length,
      totalAutores: autores.length,
      totalReferencias: referencias.length,
      totalKeywords: keywords.length,
    })

    // 1. Inserir autores (evitando duplicados pelo nome UNIQUE)
    const autoresInseridos = []
    for (const autor of autores) {
      if (!autor.nome) continue
      
      // Primeiro tenta buscar se já existe
      const { data: existente, error: erroBusca } = await supabase
        .from('autor')
        .select('autor_id, nome')
        .eq('nome', autor.nome)
        .single()
      
      if (erroBusca && erroBusca.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao buscar autor:', erroBusca)
        continue
      }
      
      let data
      if (existente) {
        data = existente
      } else {
        const { data: inserido, error: erroInsert } = await supabase
          .from('autor')
          .insert({ nome: autor.nome })
          .select()
          .single()
        
        if (erroInsert) {
          console.error('Erro ao inserir autor:', erroInsert)
          continue
        }
        data = inserido
      }
      
      autoresInseridos.push(data)
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
      
      // Buscar se já existe
      const { data: existente, error: erroBusca } = await supabase
        .from('palavra_chave')
        .select('id, nome')
        .eq('nome', keyword.nome)
        .single()
      
      if (erroBusca && erroBusca.code !== 'PGRST116') {
        console.error('Erro ao buscar palavra-chave:', erroBusca)
        continue
      }
      
      let data
      if (existente) {
        data = existente
      } else {
        const { data: inserido, error: erroInsert } = await supabase
          .from('palavra_chave')
          .insert({ nome: keyword.nome })
          .select()
          .single()
        
        if (erroInsert) {
          console.error('Erro ao inserir palavra-chave:', erroInsert)
          continue
        }
        data = inserido
      }
      
      keywordsInseridas.push(data)
    }

    // 4. Inserir index keywords
    const indexKeywordsInseridas = []
    for (const indexKeyword of keywords) {
      if (!indexKeyword.nome) continue
      
      const { data: existente, error: erroBusca } = await supabase
        .from('index_keyword')
        .select('id, nome')
        .eq('nome', indexKeyword.nome)
        .single()
      
      if (erroBusca && erroBusca.code !== 'PGRST116') {
        console.error('Erro ao buscar index keyword:', erroBusca)
        continue
      }
      
      let data
      if (existente) {
        data = existente
      } else {
        const { data: inserido, error: erroInsert } = await supabase
          .from('index_keyword')
          .insert({ nome: indexKeyword.nome })
          .select()
          .single()
        
        if (erroInsert) {
          console.error('Erro ao inserir index keyword:', erroInsert)
          continue
        }
        data = inserido
      }
      
      indexKeywordsInseridas.push(data)
    }

    // 5. Inserir referências
    const referenciasInseridas = []
    for (const referencia of referencias) {
      if (!referencia.nome) continue
      
      const { data: existente, error: erroBusca } = await supabase
        .from('references_table')
        .select('id, nome')
        .eq('nome', referencia.nome)
        .single()
      
      if (erroBusca && erroBusca.code !== 'PGRST116') {
        console.error('Erro ao buscar referência:', erroBusca)
        continue
      }
      
      let data
      if (existente) {
        data = existente
      } else {
        const { data: inserido, error: erroInsert } = await supabase
          .from('references_table')
          .insert({ nome: referencia.nome })
          .select()
          .single()
        
        if (erroInsert) {
          console.error('Erro ao inserir referência:', erroInsert)
          continue
        }
        data = inserido
      }
      
      referenciasInseridas.push(data)
    }

    // 6. Inserir ISBNs (se houver)
    const isbnsInseridos = []
    if (isbns && isbns.length > 0) {
      for (const isbn of isbns) {
        if (!isbn.valor) continue
        
        const { data: existente, error: erroBusca } = await supabase
          .from('isbn')
          .select('id, valor')
          .eq('valor', isbn.valor)
          .single()
        
        if (erroBusca && erroBusca.code !== 'PGRST116') {
          console.error('Erro ao buscar ISBN:', erroBusca)
          continue
        }
        
        let data
        if (existente) {
          data = existente
        } else {
          const { data: inserido, error: erroInsert } = await supabase
            .from('isbn')
            .insert({ valor: isbn.valor })
            .select()
            .single()
          
          if (erroInsert) {
            console.error('Erro ao inserir ISBN:', erroInsert)
            continue
          }
          data = inserido
        }
        
        isbnsInseridos.push(data)
      }
    }

    // 7. Inserir Open Access (se houver)
    const openAccessInseridos = []
    if (openAccess && openAccess.length > 0) {
      for (const oa of openAccess) {
        if (!oa.tipo) continue
        
        const { data: existente, error: erroBusca } = await supabase
          .from('open_access')
          .select('id, tipo')
          .eq('tipo', oa.tipo)
          .single()
        
        if (erroBusca && erroBusca.code !== 'PGRST116') {
          console.error('Erro ao buscar open access:', erroBusca)
          continue
        }
        
        let data
        if (existente) {
          data = existente
        } else {
          const { data: inserido, error: erroInsert } = await supabase
            .from('open_access')
            .insert({ tipo: oa.tipo })
            .select()
            .single()
          
          if (erroInsert) {
            console.error('Erro ao inserir open access:', erroInsert)
            continue
          }
          data = inserido
        }
        
        openAccessInseridos.push(data)
      }
    }

    console.log('Entidades inseridas:', {
      autores: autoresInseridos.length,
      artigos: artigosInseridos.length,
      keywords: keywordsInseridas.length,
      indexKeywords: indexKeywordsInseridas.length,
      referencias: referenciasInseridas.length,
      isbns: isbnsInseridos.length,
      openAccess: openAccessInseridos.length,
    })

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
      const { error: erroRelacao } = await supabase.from('artigo_autor').insert(artigoAutorRelations)
      if (erroRelacao) {
        console.error('Erro ao inserir relações artigo_autor:', erroRelacao)
      } else {
        console.log(`Inseridas ${artigoAutorRelations.length} relações artigo_autor`)
      }
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
      const { error: erroRelacao } = await supabase.from('artigo_palavrachave').insert(artigoPalavraChaveRelations)
      if (erroRelacao) {
        console.error('Erro ao inserir relações artigo_palavrachave:', erroRelacao)
      } else {
        console.log(`Inseridas ${artigoPalavraChaveRelations.length} relações artigo_palavrachave`)
      }
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
      const { error: erroRelacao } = await supabase.from('artigo_indexkeyword').insert(artigoIndexKeywordRelations)
      if (erroRelacao) {
        console.error('Erro ao inserir relações artigo_indexkeyword:', erroRelacao)
      } else {
        console.log(`Inseridas ${artigoIndexKeywordRelations.length} relações artigo_indexkeyword`)
      }
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
      const { error: erroRelacao } = await supabase.from('artigo_references').insert(artigoReferencesRelations)
      if (erroRelacao) {
        console.error('Erro ao inserir relações artigo_references:', erroRelacao)
      } else {
        console.log(`Inseridas ${artigoReferencesRelations.length} relações artigo_references`)
      }
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
