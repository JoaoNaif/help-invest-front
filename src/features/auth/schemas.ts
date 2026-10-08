import { z } from 'zod'

const email = z.string().trim().min(1, 'Informe seu e-mail.').email('E-mail inválido.')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha.'),
})

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome.').max(120, 'Nome muito longo.'),
  email,
  password: z
    .string()
    .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
    .max(72, 'A senha pode ter no máximo 72 caracteres.'),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
