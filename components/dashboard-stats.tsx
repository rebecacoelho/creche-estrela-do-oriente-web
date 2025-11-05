"use client"

import type { AlunoResponse } from "@/lib/students"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, UserCheck, UserX, FileWarning, DollarSign, Heart, Home, BookOpen } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

interface DashboardStatsProps {
  students: AlunoResponse[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-blue-600 font-bold text-lg">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export function DashboardStats({ students }: DashboardStatsProps) {
  const totalStudents = students.length
  const matriculados = students.filter((s) => s.ativo).length
  const preMatricula = students.filter((s) => !s.ativo).length
  const withTurma = students.filter((s) => s.turma).length
  
  const semComprovante = students.filter((s) => !s.comprovante_residencia_url).length
  const semCertidao = students.filter((s) => !s.certidao_nascimento).length
  const documentosPendentes = students.filter((s) => !s.comprovante_residencia_url || !s.certidao_nascimento).length
  
  const classDistribution = students.reduce((acc, student) => {
    const turma = student.turma || "Sem turma"
    acc[turma] = (acc[turma] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const classData = Object.entries(classDistribution).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / totalStudents) * 100).toFixed(1)
  }))
  
  const genderData = [
    { name: "Masculino", value: students.filter(s => s.genero === 'masc').length },
    { name: "Feminino", value: students.filter(s => s.genero === 'fem').length }
  ]
  
  const statusData = [
    { name: "Pré-Matrícula", value: preMatricula },
    { name: "Matriculado", value: matriculados }
  ]
  
  const ranges = [
    { range: "Até R$ 1.000", min: 0, max: 1000 },
    { range: "R$ 1.001 - R$ 2.000", min: 1001, max: 2000 },
    { range: "R$ 2.001 - R$ 3.000", min: 2001, max: 3000 },
    { range: "R$ 3.001 - R$ 5.000", min: 3001, max: 5000 },
    { range: "Acima de R$ 5.000", min: 5001, max: Infinity }
  ]
  
  const rendaData = ranges.map(({ range, min, max }) => ({
    name: range,
    value: students.filter(s => {
      const renda = s.renda_familiar_mensal || 0
      return renda >= min && renda <= max
    }).length
  })).filter(item => item.value > 0)
  
  const withSpecialNeeds = students.filter(s => 
    s.problemas_de_saude || 
    s.restricao_alimentar || 
    s.alergia || 
    s.deficiencias_multiplas ||
    s.mobilidade_reduzida ||
    (s.classificacoes && s.classificacoes.length > 0)
  ).length
  
  const receivesAuxiliary = students.filter(s => 
    s.responsavel_recebe_auxilio && 
    s.responsavel_recebe_auxilio.toLowerCase().includes('sim')
  ).length
  
  const typeOfHousingData = students.reduce((acc, student) => {
    const tipo = student.situacaohabitacional?.tipo_imovel || "Não informado"
    acc[tipo] = (acc[tipo] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const habitacaoData = Object.entries(typeOfHousingData).map(([name, value]) => ({
    name: name === 'propria' ? 'Própria' : name === 'alugada' ? 'Alugada' : name === 'cedida' ? 'Cedida' : name,
    value
  }))
  
  const studentsWithRevenue = students.filter(s => s.renda_familiar_mensal && s.renda_familiar_mensal > 0)
  
  const averagePerCapitaRevenue = studentsWithRevenue.length > 0
    ? (studentsWithRevenue.reduce((sum, s) => {
        const familyMembers = (s.composicao_familiar?.length || 0) + 1
        const familyRevenue = s.renda_familiar_mensal || 0
        
        const numMembros = familyMembers > 1 ? familyMembers : 3
        const perCapitaRevenue = familyRevenue / numMembros
        
        return sum + perCapitaRevenue
      }, 0) / studentsWithRevenue.length).toFixed(2)
    : "0.00"
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  const stats = [
    {
      title: "Total de Alunos",
      value: totalStudents,
      description: "Alunos cadastrados",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Matriculados",
      value: matriculados,
      description: `${((matriculados / totalStudents) * 100).toFixed(1)}% do total`,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pré-Matrícula",
      value: preMatricula,
      description: `${((preMatricula / totalStudents) * 100).toFixed(1)}% do total`,
      icon: UserX,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Documentos Pendentes",
      value: documentosPendentes,
      description: `${semComprovante} sem comprovante, ${semCertidao} sem certidão`,
      icon: FileWarning,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Renda Per Capita Média",
      value: `R$ ${averagePerCapitaRevenue}`,
      description: studentsWithRevenue.length > 0 
        ? `Renda familiar / membros (${studentsWithRevenue.length} ${studentsWithRevenue.length === 1 ? 'família' : 'famílias'})` 
        : "Nenhuma renda cadastrada",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Necessidades Especiais",
      value: withSpecialNeeds,
      description: `${((withSpecialNeeds / totalStudents) * 100).toFixed(1)}% do total`,
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      title: "Recebem Auxílio",
      value: receivesAuxiliary,
      description: `${((receivesAuxiliary / totalStudents) * 100).toFixed(1)}% das famílias`,
      icon: Home,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "Com Turma Definida",
      value: withTurma,
      description: `${((withTurma / totalStudents) * 100).toFixed(1)}% do total`,
      icon: BookOpen,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Turma</CardTitle>
            <CardDescription>Quantidade de alunos em cada turma</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Gênero</CardTitle>
            <CardDescription>Proporção de meninos e meninas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status de Matrícula</CardTitle>
            <CardDescription>Situação atual dos alunos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === "Matriculado" ? "#10b981" : "#f59e0b"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faixas de Renda Familiar</CardTitle>
            <CardDescription>Distribuição socioeconômica das famílias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rendaData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Situação Habitacional</CardTitle>
            <CardDescription>Tipo de moradia das famílias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={habitacaoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {habitacaoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Documentos</CardTitle>
            <CardDescription>Pendências de documentação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-900">Documentos Completos</p>
                  <p className="text-xs text-green-700">Comprovante e certidão</p>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {totalStudents - documentosPendentes}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-yellow-900">Sem Comprovante</p>
                  <p className="text-xs text-yellow-700">Comprovante de residência pendente</p>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {semComprovante}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-orange-900">Sem Certidão</p>
                  <p className="text-xs text-orange-700">Certidão de nascimento pendente</p>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {semCertidao}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Irmãos na Creche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {students.filter(s => s.irmao_na_creche).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Alunos com irmãos matriculados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gêmeos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {students.filter(s => s.gemeos).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Alunos que são gêmeos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Restrições Alimentares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {students.filter(s => s.restricao_alimentar || s.alergia).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Alunos com restrições ou alergias
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
