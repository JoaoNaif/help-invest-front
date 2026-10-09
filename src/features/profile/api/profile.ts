import { isAxiosError } from 'axios'
import { z } from 'zod'
import { api } from '@/lib/api'

export const investorProfileSchema = z.object({
  id: z.string(),
  monthlyIncome: z.string(),
  emergencyReserve: z.string(),
  goal: z.string(),
  horizonMonths: z.number(),
  riskTolerance: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type InvestorProfile = z.infer<typeof investorProfileSchema>

const getResponseSchema = z.object({ profile: investorProfileSchema, isOutdated: z.boolean() })
const saveResponseSchema = z.object({ profile: investorProfileSchema })

export type ProfileState = { profile: InvestorProfile; isOutdated: boolean }

export type SaveProfileInput = {
  monthlyIncome: string
  emergencyReserve: string
  goal: string
  horizonMonths: number
  riskTolerance: string
}

/** `null` = o usuário ainda não preencheu (404 do backend), não é erro. */
export async function fetchProfile(): Promise<ProfileState | null> {
  try {
    const { data } = await api.get('/investor-profile')
    return getResponseSchema.parse(data)
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export async function saveProfile(input: SaveProfileInput): Promise<InvestorProfile> {
  const { data } = await api.put('/investor-profile', input)
  return saveResponseSchema.parse(data).profile
}
