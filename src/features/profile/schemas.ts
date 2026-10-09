import { z } from 'zod'
import { normalizeDecimal, toInputDecimal } from '@/lib/decimal-input'
import { GOALS, RISK_LEVELS } from '@/lib/labels'
import type { InvestorProfile, SaveProfileInput } from './api/profile'

// `normalizeDecimal` já recusa sinal negativo, então "zero ou mais" fica garantido.
const moneyField = z
  .string()
  .refine((value) => normalizeDecimal(value) !== null, 'Informe um valor (pode ser 0).')

export const profileFormSchema = z.object({
  monthlyIncome: moneyField,
  emergencyReserve: moneyField,
  goal: z.enum(GOALS, { message: 'Escolha um objetivo.' }),
  horizonMonths: z
    .string()
    .refine((v) => /^\d+$/.test(v.trim()) && Number(v) > 0 && Number(v) <= 600, 'Informe os meses (1 a 600).'),
  riskTolerance: z.enum(RISK_LEVELS, { message: 'Escolha um perfil.' }),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

/** Valores iniciais em branco; os enums entram como "" até o usuário escolher. */
export const emptyProfileValues = {
  monthlyIncome: '',
  emergencyReserve: '',
  goal: '',
  horizonMonths: '',
  riskTolerance: '',
} as unknown as ProfileFormValues

export function toProfileFormValues(profile: InvestorProfile): ProfileFormValues {
  return {
    monthlyIncome: toInputDecimal(profile.monthlyIncome),
    emergencyReserve: toInputDecimal(profile.emergencyReserve),
    goal: profile.goal as ProfileFormValues['goal'],
    horizonMonths: String(profile.horizonMonths),
    riskTolerance: profile.riskTolerance as ProfileFormValues['riskTolerance'],
  }
}

export function toSaveInput(values: ProfileFormValues): SaveProfileInput {
  return {
    monthlyIncome: normalizeDecimal(values.monthlyIncome) ?? '0',
    emergencyReserve: normalizeDecimal(values.emergencyReserve) ?? '0',
    goal: values.goal,
    horizonMonths: Number(values.horizonMonths),
    riskTolerance: values.riskTolerance,
  }
}
