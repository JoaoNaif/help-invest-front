import { z } from 'zod'

export const alertSchema = z.object({
  code: z.string(),
  // Severidade desconhecida não quebra a tela: cai em INFO.
  severity: z.enum(['INFO', 'WARNING', 'DANGER']).catch('INFO'),
  message: z.string(),
})

export type Alert = z.infer<typeof alertSchema>
