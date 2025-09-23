# Creche Estrela do Oriente

Sistema de gestão completo para creche com dashboard administrativo, cadastro de alunos e relatórios.

## Sobre o Projeto

O sistema da Creche Estrela do Oriente é uma aplicação web desenvolvida para facilitar a gestão da creche, oferecendo uma interface moderna e intuitiva para administrar informações de alunos, responsáveis e gerar relatórios.

## Funcionalidades

### Autenticação
- Sistema de login e registro de usuários
- Autenticação JWT com refresh token automático
- Controle de sessão e logout seguro

### Gestão de Alunos
- **Cadastro completo de alunos** com formulário multi-etapas
- **Informações pessoais**: nome, matrícula, data de nascimento, gênero
- **Dados acadêmicos**: turma, status (ativo/inativo)
- **Upload de documentos**: comprovante de residência
- **Edição e exclusão** de registros
- **Sistema de busca e filtros** por nome, status e turma

### Gestão de Responsáveis
- Cadastro de responsáveis vinculados aos alunos
- Informações de contato: nome, CPF, telefone, email, endereço
- Dados socioeconômicos: renda familiar mensal

### Dashboard e Relatórios
- **Estatísticas em tempo real**:
  - Total de alunos cadastrados
  - Alunos ativos e inativos
  - Alunos com turma definida
- **Tabela interativa** com filtros avançados
- **Exportação de dados** em formato CSV
- Interface responsiva para diferentes dispositivos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de estilização
- **React Hook Form** - Gerenciamento de formulários
- **Lucide React** - Ícones

### Componentes UI
- Radix UI - Componentes acessíveis

### Backend Integration
- API REST integrada
- Autenticação JWT
- Upload de arquivos
- Paginação de dados

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- pnpm (gerenciador de pacotes)

### Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd creche
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Execute o projeto em desenvolvimento**
```bash
pnpm dev
```

4. **Acesse a aplicação**
```
http://localhost:3000
```

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Executar em produção
pnpm start

# Linting
pnpm lint
```

## 📁 Estrutura do Projeto

```
creche/
├── app/                    # App Router (Next.js 14)
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── dashboard-page.tsx # Página do dashboard
│   ├── dashboard-stats.tsx # Estatísticas do dashboard
│   ├── login-form.tsx     # Formulário de login
│   ├── student-form-multi-step.tsx # Cadastro de alunos
│   ├── student-edit-form.tsx # Edição de alunos
│   └── students-table.tsx # Tabela de alunos
├── lib/                   # Utilitários e serviços
│   ├── auth.tsx          # Context de autenticação
│   ├── students.ts       # Serviços de alunos
│   └── utils.ts          # Funções utilitárias
├── hooks/                 # Hooks customizados
├── public/               # Arquivos estáticos
└── styles/               # Estilos adicionais
```

## 🔌 Integração com API

O sistema se integra com uma API REST hospedada em:
```
https://estreladooriente-production.up.railway.app/api
```

### Endpoints principais:
- `POST /token/` - Autenticação
- `POST /register/` - Registro de usuários
- `GET /alunos/` - Listar alunos
- `POST /alunos/` - Criar aluno
- `PATCH /alunos/{id}/` - Atualizar aluno
- `DELETE /alunos/{id}/` - Excluir aluno
- `POST /responsaveis/` - Criar responsável

## 👥 Tipos de Usuário

### Administrador
- Acesso completo ao sistema
- Gerenciamento de alunos e responsáveis
- Visualização de relatórios e estatísticas
- Exportação de dados

## 📱 Responsividade

O sistema foi desenvolvido com design responsivo, funcionando perfeitamente em:
- 💻 Desktops
- 📱 Tablets
- 📱 Smartphones

## 🔒 Segurança

- Autenticação JWT com tokens de acesso e refresh
- Validação de dados no frontend e backend
- Controle de sessão automático
- Upload seguro de arquivos

## 📈 Funcionalidades Futuras

- [ ] Sistema de notificações
- [ ] Relatórios avançados com gráficos
- [ ] Gestão de professores
- [ ] Sistema de mensagens
- [ ] Controle de frequência
- [ ] Gestão financeira

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas sobre o sistema, entre em contato através dos canais oficiais da Creche Estrela do Oriente.

---

Desenvolvido com ❤️ para a Creche Estrela do Oriente
