import { z } from 'zod'
import { api } from '@/lib/api'

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
})

export type User = z.infer<typeof userSchema>

const meResponseSchema = z.object({ user: userSchema })

export async function fetchMe(): Promise<User> {
  const { data } = await api.get('/me')
  return meResponseSchema.parse(data).user
}

export type RegisterInput = { name: string; email: string; password: string }
export type LoginInput = { email: string; password: string }

export async function createAccount(input: RegisterInput): Promise<void> {
  await api.post('/accounts', input)
}

export async function createSession(input: LoginInput): Promise<void> {
  await api.post('/sessions', input)
}

export async function logout(): Promise<void> {
  await api.delete('/sessions')
}
