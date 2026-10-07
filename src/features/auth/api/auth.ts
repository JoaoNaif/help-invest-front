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

export async function logout(): Promise<void> {
  await api.delete('/sessions')
}
