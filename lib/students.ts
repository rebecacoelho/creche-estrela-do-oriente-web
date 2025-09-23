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
  telefone: string
  email: string
  endereco: string
  dados_extra?: DadosExtra | null
}

export interface ResponsavelResponse extends Responsavel {
  id: number
}

export interface Aluno {
  nome: string
  matricula?: string | null
  data_nascimento: string
  genero: 'masc' | 'fem'
  responsaveis: number[]
  turma?: string | null
  renda_familiar_mensal?: string | null
  ativo?: boolean
  comprovante_residencia_url?: File | null
}

export interface AlunoFormData {
  nome: string
  matricula?: string | null
  data_nascimento: string
  genero: 'masc' | 'fem'
  responsaveis: number[]
  turma?: string | null
  renda_familiar_mensal?: string | null
  ativo?: boolean
  comprovante_residencia_url: File
}

export interface AlunoResponse extends Aluno {
  id: number
  criado_em: string
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
    
    alunoData.responsaveis.forEach(responsavelId => {
      formData.append('responsaveis', responsavelId.toString())
    })
    
    formData.append('ativo', (alunoData.ativo ?? true).toString())
    formData.append('comprovante_residencia_url', alunoData.comprovante_residencia_url)

    if (alunoData.matricula) {
      formData.append('matricula', alunoData.matricula)
    }
    if (alunoData.turma) {
      formData.append('turma', alunoData.turma)
    }
    if (alunoData.renda_familiar_mensal) {
      formData.append('renda_familiar_mensal', alunoData.renda_familiar_mensal)
    }

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
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError)
      }
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
      "Nome",
      "Matrícula",
      "Data de Nascimento",
      "Gênero",
      "Turma",
      "Renda Familiar",
      "Ativo",
      "Criado em",
    ]

    const csvContent = [
      headers.join(","),
      ...alunos.map((aluno) =>
        [
          aluno.id,
          aluno.nome,
          aluno.matricula || "",
          aluno.data_nascimento,
          aluno.genero === 'masc' ? 'Masculino' : 'Feminino',
          aluno.turma || "",
          aluno.renda_familiar_mensal || "",
          aluno.ativo ? 'Sim' : 'Não',
          new Date(aluno.criado_em).toLocaleDateString('pt-BR'),
        ]
          .map((field) => `"${field}"`)
          .join(","),
      ),
    ].join("\n")

    return csvContent
  },
}

export const createStudentComplete = async (studentData: {
  nomeResponsavel: string
  cpf: string
  telefoneResponsavel: string
  emailResponsavel: string
  endereco: string
  dadosExtra?: DadosExtra | null
  
  nomeAluno: string
  matricula?: string | null
  dataNascimento: string
  genero: 'masc' | 'fem'
  turma?: string | null
  rendaFamiliarMensal?: string | null
  ativo?: boolean
  comprovanteFile: File
}): Promise<{ responsavel: ResponsavelResponse; aluno: AlunoResponse }> => {
  try {
    const responsavel = await responsaveisService.create({
      nome: studentData.nomeResponsavel,
      cpf: studentData.cpf,
      telefone: studentData.telefoneResponsavel,
      email: studentData.emailResponsavel,
      endereco: studentData.endereco,
      dados_extra: studentData.dadosExtra,
    })

    const aluno = await alunosService.createWithFile({
      nome: studentData.nomeAluno,
      matricula: studentData.matricula,
      data_nascimento: studentData.dataNascimento,
      genero: studentData.genero,
      responsaveis: [responsavel.id],
      turma: studentData.turma,
      renda_familiar_mensal: studentData.rendaFamiliarMensal,
      ativo: studentData.ativo ?? true,
      comprovante_residencia_url: studentData.comprovanteFile,
    })

    return { responsavel, aluno }
  } catch (error) {
    throw new Error('Erro ao criar aluno e responsável')
  }
}
