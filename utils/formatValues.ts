export const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  const part1 = digits.slice(0, 3)
  const part2 = digits.slice(3, 6)
  const part3 = digits.slice(6, 9)
  const part4 = digits.slice(9, 11)
  let out = part1
  if (part2) out += `.${part2}`
  if (part3) out += `.${part3}`
  if (part4) out += `-${part4}`
  return out
}

export const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  const ddd = digits.slice(0, 2)
  const first = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6)
  const last = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10)
  let out = ''
  if (ddd) out += `(${ddd}`
  if (ddd && (first || last)) out += ') '
  if (first) out += first
  if (last) out += `-${last}`
  return out
}

export const getClassCode = (turma?: string) => {
  if (!turma) return 'XX'
  const map: Record<string, string> = {
    'Infantil A': 'IA',
    'Infantil B': 'IB',
    'Maternal A': 'MA',
    'Maternal B': 'MB',
    'Jardim A': 'JA',
    'Jardim B': 'JB',
  }
  return map[turma] || turma.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3)
}

export const generateRandomAlnum = (len: number) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export const generateRegistration = (turma?: string) => {
  const code = getClassCode(turma)
  const year = new Date().getFullYear().toString().slice(2)
  const token = generateRandomAlnum(5)
  return `${code}-${year}-${token}`
}