let authenticatedRequestFn: ((url: string, options?: RequestInit) => Promise<Response>) | null = null

export const setAuthenticatedRequestFn = (fn: (url: string, options?: RequestInit) => Promise<Response>) => {
  authenticatedRequestFn = fn
}

export interface DadosExtra {
  [key: string]: any
}

export interface Responsavel {
  nome: string
  cpf: string
  rg?: string
  telefone: string
  email: string
  endereco_texto?: string  
  profissao?: string
  local_trabalho?: string
  data_nascimento?: string
  renda_mensal?: number
}

export interface ResponsavelResponse extends Responsavel {
  id: number
}

export interface DocumentosAluno {
  certidao_nascimento_matricula: string
  municipio_nascimento: string
  municipio_registro: string
  cartorio_registro: string
  arquivo_certidao?: File | string | null
  cpf: string
  rg: string
  data_emissao_rg: string
  orgao_emissor_rg: string
}

export interface Endereco {
  logradouro: string
  numero: string
  ponto_referencia?: string
  bairro: string
  municipio: string
  uf: string
  cep: string
}

export interface SituacaoHabitacional {
  tipo_imovel: 'propria' | 'cedida' | 'alugada'
  valor_aluguel?: number | null
  numero_comodos: number
  piso_cimento: boolean
  piso_lajota: boolean
  piso_chao_batido: boolean
  tipo_moradia_estrutura: string[]
  saneamento_fossa: boolean
  saneamento_cifon: boolean
  energia_eletrica: boolean
  agua_encanada: boolean
}

export interface BensDomicilio {
  tv: boolean
  dvd: boolean
  radio: boolean
  computador: boolean
  notebook: boolean
  telefone_fixo: boolean
  telefone_celular: boolean
  tablet: boolean
  internet: boolean
  tv_assinatura: boolean
  fogao: boolean
  geladeira: boolean
  freezer: boolean
  micro_ondas: boolean
  maquina_lavar_roupa: boolean
  ar_condicionado: boolean
  bicicleta: boolean
  moto: boolean
  automovel: boolean
}

export interface MembroFamiliar {
  id?: number
  nome: string
  idade: number
  parentesco: string
  situacao_escolar?: string
  situacao_emprego?: string
  renda_bruta: number
}

export interface PessoaAutorizada {
  id?: number
  nome: string
  parentesco: string
  rg: string
  fone: string
  e_responsavel_legal?: boolean
}

export interface Aluno {
  nome: string
  matricula?: string | null
  data_nascimento: string
  genero: 'masc' | 'fem'
  raca: 'branca' | 'parda' | 'negra'
  responsaveis: number[]
  turma?: string | null
  renda_familiar_mensal?: number | null
  ativo?: boolean
  comprovante_residencia_url?: File | string | null
  status_matricula?: 'pre_matricula' | 'matricula' | 'rematricula'
  
  // Campos adicionais do aluno
  gemeos?: string | null
  irmao_na_creche?: boolean
  cadastro_nacional_de_saude: string
  unidade_de_saude: string
  problemas_de_saude?: boolean
  restricao_alimentar?: string | null
  alergia?: string | null
  deficiencias_multiplas?: string | null
  mobilidade_reduzida?: 'temp' | 'perm' | null
  crianca_alvo_educacao_especial?: string | null
  classificacoes?: string[]
  responsavel_recebe_auxilio: string
  telefone: string
  certidao_nascimento?: File | string | null
  serie_cursar?: string | null
  ano_cursar?: string | null
  
  endereco: Endereco
  documentosaluno: DocumentosAluno
  situacaohabitacional: SituacaoHabitacional
  bensdomicilio: BensDomicilio
  composicao_familiar: MembroFamiliar[]
  autorizados_retirada: PessoaAutorizada[]
}

export interface AlunoFormData extends Aluno {
  comprovante_residencia_url: File
}

export interface AlunoResponse {
  id: number
  nome: string
  matricula?: string | null
  data_nascimento: string
  genero: 'masc' | 'fem'
  raca: 'branca' | 'parda' | 'negra'
  responsaveis: number[]
  turma?: string | null
  renda_familiar_mensal?: number | null
  renda_familiar_total: number
  renda_per_capta: number
  ativo: boolean
  criado_em: string
  comprovante_residencia_url?: string | null
  status_matricula: 'pre_matricula' | 'matricula' | 'rematricula'
  
  gemeos?: string | null
  irmao_na_creche?: boolean
  cadastro_nacional_de_saude: string
  unidade_de_saude: string
  problemas_de_saude?: boolean
  restricao_alimentar?: string | null
  alergia?: string | null
  deficiencias_multiplas?: string | null
  mobilidade_reduzida?: 'temp' | 'perm' | null
  crianca_alvo_educacao_especial?: string | null
  classificacoes?: string[]
  responsavel_recebe_auxilio: string
  telefone: string
  certidao_nascimento?: string | null
  serie_cursar?: string | null
  ano_cursar?: string | null
  
  endereco: Endereco
  documentosaluno: DocumentosAluno
  situacaohabitacional: SituacaoHabitacional
  bensdomicilio: BensDomicilio
  composicao_familiar: MembroFamiliar[]
  autorizados_retirada: PessoaAutorizada[]
}

export interface PaginatedAlunosResponse {
  count: number
  next?: string | null
  previous?: string | null
  results: AlunoResponse[]
}


export const responsaveisService = {
  create: async (responsavelData: Responsavel): Promise<ResponsavelResponse> => {
    if (!authenticatedRequestFn) {
      throw new Error('Falha na Autenticação autenticada não configurada')
    }

    const response = await authenticatedRequestFn('https://estreladooriente-production.up.railway.app/api/responsaveis/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responsavelData),
    })

    if (!response.ok) {
      throw new Error('Erro ao criar responsável')
    }

    return response.json()
  },

  getAll: async (): Promise<ResponsavelResponse[]> => {
    if (!authenticatedRequestFn) {
      console.error('Falha na Autenticação autenticada não configurada')
      return []
    }

    try {
      const response = await authenticatedRequestFn('https://estreladooriente-production.up.railway.app/api/responsaveis/', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar responsáveis')
      }

      const data = await response.json()
      return Array.isArray(data) ? data : data.results || []
    } catch (error) {
      console.error('Erro ao carregar responsáveis:', error)
      return []
    }
  },
}

export const alunosService = {
  create: async (alunoData: Aluno): Promise<AlunoResponse> => {
    if (!authenticatedRequestFn) {
      throw new Error('Falha na Autenticação autenticada não configurada')
    }

    const response = await authenticatedRequestFn('https://estreladooriente-production.up.railway.app/api/alunos/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alunoData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Erro da API:', errorData)
      
      throw new Error('Erro ao criar aluno. Verifique os dados fornecidos.')
    }

    return response.json()
  },

  createWithFile: async (alunoData: AlunoFormData): Promise<AlunoResponse> => {
    if (!authenticatedRequestFn) {
      throw new Error('Falha na Autenticação autenticada não configurada')
    }

    const formData = new FormData()
    
    formData.append('nome', alunoData.nome)
    formData.append('data_nascimento', alunoData.data_nascimento)
    formData.append('genero', alunoData.genero)
    formData.append('raca', alunoData.raca)
    formData.append('cadastro_nacional_de_saude', alunoData.cadastro_nacional_de_saude)
    formData.append('unidade_de_saude', alunoData.unidade_de_saude)
    formData.append('responsavel_recebe_auxilio', alunoData.responsavel_recebe_auxilio)
    formData.append('telefone', alunoData.telefone)
    
    alunoData.responsaveis.forEach(id => {
      formData.append('responsaveis', id.toString())
    })
    
    formData.append('ativo', (alunoData.ativo ?? true).toString())
    formData.append('comprovante_residencia_url', alunoData.comprovante_residencia_url)

    if (alunoData.matricula) formData.append('matricula', alunoData.matricula)
    if (alunoData.turma) formData.append('turma', alunoData.turma)
    if (alunoData.renda_familiar_mensal) formData.append('renda_familiar_mensal', alunoData.renda_familiar_mensal.toString())
    if (alunoData.gemeos) formData.append('gemeos', alunoData.gemeos)
    if (alunoData.irmao_na_creche !== undefined) formData.append('irmao_na_creche', alunoData.irmao_na_creche.toString())
    if (alunoData.problemas_de_saude !== undefined) formData.append('problemas_de_saude', alunoData.problemas_de_saude.toString())
    if (alunoData.restricao_alimentar) formData.append('restricao_alimentar', alunoData.restricao_alimentar)
    if (alunoData.alergia) formData.append('alergia', alunoData.alergia)
    if (alunoData.deficiencias_multiplas) formData.append('deficiencias_multiplas', alunoData.deficiencias_multiplas)
    if (alunoData.mobilidade_reduzida) formData.append('mobilidade_reduzida', alunoData.mobilidade_reduzida)
    if (alunoData.crianca_alvo_educacao_especial) formData.append('crianca_alvo_educacao_especial', alunoData.crianca_alvo_educacao_especial)
    if (alunoData.serie_cursar) formData.append('serie_cursar', alunoData.serie_cursar)
    if (alunoData.ano_cursar) formData.append('ano_cursar', alunoData.ano_cursar)
    
    if (alunoData.classificacoes && alunoData.classificacoes.length > 0) {
      alunoData.classificacoes.forEach(classificacao => {
        formData.append('classificacoes', classificacao)
      })
    }
    
    if (alunoData.certidao_nascimento && alunoData.certidao_nascimento instanceof File) {
      formData.append('certidao_nascimento', alunoData.certidao_nascimento)
    }
    
    Object.entries(alunoData.endereco).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(`endereco.${key}`, String(value))
      }
    })
    
    Object.entries(alunoData.documentosaluno).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(`documentosaluno.${key}`, String(value))
      }
    })
    
    Object.entries(alunoData.situacaohabitacional).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'tipo_moradia_estrutura' && Array.isArray(value)) {
          value.forEach(item => formData.append(`situacaohabitacional.${key}`, item))
        } else {
          formData.append(`situacaohabitacional.${key}`, String(value))
        }
      }
    })
    
    Object.entries(alunoData.bensdomicilio).forEach(([key, value]) => {
      formData.append(`bensdomicilio.${key}`, String(value))
    })
    
    formData.append('composicao_familiar', JSON.stringify(alunoData.composicao_familiar))
    
    formData.append('autorizados_retirada', JSON.stringify(alunoData.autorizados_retirada))

    const response = await authenticatedRequestFn('https://estreladooriente-production.up.railway.app/api/alunos/', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let errorData: any = {}
      try {
        const responseText = await response.text()
        
        if (responseText) {
          errorData = JSON.parse(responseText)
        }
        console.error('Erro da API:', errorData)
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError)
      }
      throw new Error('Erro ao criar aluno. Verifique os dados fornecidos.')
    }

    return response.json()
  },
}

export const studentsService = {
  getAll: async (limit?: number, offset?: number): Promise<AlunoResponse[]> => {
    if (!authenticatedRequestFn) {
      console.error('Falha na Autenticação autenticada não configurada')
      return []
    }

    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (offset) params.append('offset', offset.toString())
      
      const url = `https://estreladooriente-production.up.railway.app/api/alunos/${params.toString() ? '?' + params.toString() : ''}`
      const response = await authenticatedRequestFn(url, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar alunos')
      }

      const data: PaginatedAlunosResponse = await response.json()
      return data.results
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
      return []
    }
  },

  getById: async (id: string): Promise<AlunoResponse | null> => {
    if (!authenticatedRequestFn) {
      console.error('Falha na Autenticação autenticada não configurada')
      return null
    }

    try {
      const response = await authenticatedRequestFn(`https://estreladooriente-production.up.railway.app/api/alunos/${id}/`, {
        method: 'GET',
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Erro ao buscar aluno')
      }

      const aluno: AlunoResponse = await response.json()
      return aluno
    } catch (error) {
      console.error('Erro ao carregar aluno:', error)
      return null
    }
  },

  delete: async (id: string): Promise<boolean> => {
    if (!authenticatedRequestFn) {
      console.error('Falha na Autenticação autenticada não configurada')
      return false
    }

    try {
      const response = await authenticatedRequestFn(`https://estreladooriente-production.up.railway.app/api/alunos/${id}/`, {
        method: 'DELETE',
      })

      return response.ok
    } catch (error) {
      console.error('Erro ao excluir aluno:', error)
      return false
    }
  },

  update: async (id: string, alunoData: Partial<Aluno>): Promise<AlunoResponse | null> => {
    if (!authenticatedRequestFn) {
      console.error('Falha na Autenticação autenticada não configurada')
      return null
    }

    try {
      const response = await authenticatedRequestFn(`https://estreladooriente-production.up.railway.app/api/alunos/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alunoData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro da API:', errorData)
        throw new Error('Erro ao atualizar aluno. Verifique os dados fornecidos.')
      }

      return response.json()
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error)
      return null
    }
  },

  updateWithFile: async (id: string, alunoData: any): Promise<AlunoResponse | null> => {
    if (!authenticatedRequestFn) {
      console.error('Falha na Autenticação autenticada não configurada')
      return null
    }

    try {
      const formData = new FormData()
      
      if (alunoData.nome) formData.append('nome', alunoData.nome)
      if (alunoData.data_nascimento) formData.append('data_nascimento', alunoData.data_nascimento)
      if (alunoData.genero) formData.append('genero', alunoData.genero)
      if (alunoData.matricula) formData.append('matricula', alunoData.matricula)
      if (alunoData.turma) formData.append('turma', alunoData.turma)
      if (alunoData.renda_familiar_mensal) formData.append('renda_familiar_mensal', alunoData.renda_familiar_mensal)
      if (alunoData.ativo !== undefined) formData.append('ativo', alunoData.ativo.toString())
      if (alunoData.comprovante_residencia_url) formData.append('comprovante_residencia_url', alunoData.comprovante_residencia_url)
      
      if (alunoData.responsaveis) {
        alunoData.responsaveis.forEach((responsavelId: number) => {
          formData.append('responsaveis', responsavelId.toString())
        })
      }

      const response = await authenticatedRequestFn(`https://estreladooriente-production.up.railway.app/api/alunos/${id}/`, {
        method: 'PATCH',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro da API:', errorData)
        throw new Error('Erro ao atualizar aluno. Verifique os dados fornecidos.')
      }

      return response.json()
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error)
      return null
    }
  },

  exportToCsv: (alunos: AlunoResponse[]): string => {
    const headers = [
      "ID",
      "Matrícula",
      "Nome",
      "Data de Nascimento",
      "Gênero",
      "Raça",
      "Turma",
      "Série a Cursar",
      "Ano a Cursar",
      "Telefone",
      "Ativo",
      "Criado em",
      
      "Gêmeos",
      "Irmão na Creche",
      "Responsável Recebe Auxílio",
      "Renda Familiar Mensal",
      "Renda Familiar Total",
      "Renda Per Capita",
      
      "Cadastro Nacional de Saúde",
      "Unidade de Saúde",
      "Problemas de Saúde",
      "Restrição Alimentar",
      "Alergia",
      "Deficiências Múltiplas",
      "Mobilidade Reduzida",
      "Criança Alvo Educação Especial",
      "Classificações",
      
      "Logradouro",
      "Número",
      "Ponto de Referência",
      "Bairro",
      "Município",
      "UF",
      "CEP",
      
      "CPF",
      "RG",
      "Data Emissão RG",
      "Órgão Emissor RG",
      "Certidão Nascimento Matrícula",
      "Município Nascimento",
      "Município Registro",
      "Cartório Registro",
      
      "Tipo de Imóvel",
      "Valor Aluguel",
      "Número de Cômodos",
      "Piso Cimento",
      "Piso Lajota",
      "Piso Chão Batido",
      "Tipo Moradia Estrutura",
      "Saneamento Fossa",
      "Saneamento Cifon",
      "Energia Elétrica",
      "Água Encanada",
      
      "TV",
      "DVD",
      "Rádio",
      "Computador",
      "Notebook",
      "Telefone Fixo",
      "Telefone Celular",
      "Tablet",
      "Internet",
      "TV Assinatura",
      "Fogão",
      "Geladeira",
      "Freezer",
      "Micro-ondas",
      "Máquina Lavar Roupa",
      "Ar Condicionado",
      "Bicicleta",
      "Moto",
      "Automóvel",
      
      // Responsáveis
      "Responsáveis (IDs)",
      "Responsáveis (Nomes)",
      
      // Composição Familiar
      "Composição Familiar (JSON)",
      
      // Autorizados Retirada
      "Autorizados Retirada (JSON)",
    ]

    const csvContent = [
      headers.join(","),
      ...alunos.map((aluno) => {
        const endereco = aluno.endereco || {}
        const docs = aluno.documentosaluno || {}
        const situacao = aluno.situacaohabitacional || {}
        const bens = aluno.bensdomicilio || {}
        
        return [
          // Dados Básicos
          aluno.id,
          aluno.matricula || "",
          aluno.nome,
          aluno.data_nascimento,
          aluno.genero === 'masc' ? 'Masculino' : aluno.genero === 'fem' ? 'Feminino' : '',
          aluno.raca || "",
          aluno.turma || "",
          aluno.serie_cursar || "",
          aluno.ano_cursar || "",
          aluno.telefone || "",
          aluno.ativo ? 'Sim' : 'Não',
          new Date(aluno.criado_em).toLocaleDateString('pt-BR'),
          
          // Família
          aluno.gemeos || "",
          aluno.irmao_na_creche ? 'Sim' : 'Não',
          aluno.responsavel_recebe_auxilio || "",
          aluno.renda_familiar_mensal || "",
          aluno.renda_familiar_total || "",
          aluno.renda_per_capta || "",
          
          // Saúde
          aluno.cadastro_nacional_de_saude || "",
          aluno.unidade_de_saude || "",
          aluno.problemas_de_saude ? 'Sim' : 'Não',
          aluno.restricao_alimentar || "",
          aluno.alergia || "",
          aluno.deficiencias_multiplas || "",
          aluno.mobilidade_reduzida === 'temp' ? 'Temporária' : aluno.mobilidade_reduzida === 'perm' ? 'Permanente' : '',
          aluno.crianca_alvo_educacao_especial || "",
          Array.isArray(aluno.classificacoes) ? aluno.classificacoes.join('; ') : '',
          
          // Endereço
          endereco.logradouro || "",
          endereco.numero || "",
          endereco.ponto_referencia || "",
          endereco.bairro || "",
          endereco.municipio || "",
          endereco.uf || "",
          endereco.cep || "",
          
          // Documentos
          docs.cpf || "",
          docs.rg || "",
          docs.data_emissao_rg || "",
          docs.orgao_emissor_rg || "",
          docs.certidao_nascimento_matricula || "",
          docs.municipio_nascimento || "",
          docs.municipio_registro || "",
          docs.cartorio_registro || "",
          
          // Situação Habitacional
          situacao.tipo_imovel || "",
          situacao.valor_aluguel || "",
          situacao.numero_comodos || "",
          situacao.piso_cimento ? 'Sim' : 'Não',
          situacao.piso_lajota ? 'Sim' : 'Não',
          situacao.piso_chao_batido ? 'Sim' : 'Não',
          Array.isArray(situacao.tipo_moradia_estrutura) ? situacao.tipo_moradia_estrutura.join('; ') : '',
          situacao.saneamento_fossa ? 'Sim' : 'Não',
          situacao.saneamento_cifon ? 'Sim' : 'Não',
          situacao.energia_eletrica ? 'Sim' : 'Não',
          situacao.agua_encanada ? 'Sim' : 'Não',
          
          // Bens do Domicílio
          bens.tv ? 'Sim' : 'Não',
          bens.dvd ? 'Sim' : 'Não',
          bens.radio ? 'Sim' : 'Não',
          bens.computador ? 'Sim' : 'Não',
          bens.notebook ? 'Sim' : 'Não',
          bens.telefone_fixo ? 'Sim' : 'Não',
          bens.telefone_celular ? 'Sim' : 'Não',
          bens.tablet ? 'Sim' : 'Não',
          bens.internet ? 'Sim' : 'Não',
          bens.tv_assinatura ? 'Sim' : 'Não',
          bens.fogao ? 'Sim' : 'Não',
          bens.geladeira ? 'Sim' : 'Não',
          bens.freezer ? 'Sim' : 'Não',
          bens.micro_ondas ? 'Sim' : 'Não',
          bens.maquina_lavar_roupa ? 'Sim' : 'Não',
          bens.ar_condicionado ? 'Sim' : 'Não',
          bens.bicicleta ? 'Sim' : 'Não',
          bens.moto ? 'Sim' : 'Não',
          bens.automovel ? 'Sim' : 'Não',
          
          Array.isArray(aluno.responsaveis) ? aluno.responsaveis.join('; ') : '',
          '', 
          
          Array.isArray(aluno.composicao_familiar) ? JSON.stringify(aluno.composicao_familiar) : '',
          
          Array.isArray(aluno.autorizados_retirada) ? JSON.stringify(aluno.autorizados_retirada) : '',
        ]
          .map((field) => {
            const stringField = String(field ?? '')
            return `"${stringField.replace(/"/g, '""')}"`
          })
          .join(",")
      }),
    ].join("\n")

    return csvContent
  },
}
