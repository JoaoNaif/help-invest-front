import { PagePlaceholder } from '@/components/ui/PagePlaceholder'

export function AuthPage() {
  return (
    <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-4">
      <PagePlaceholder title="Entrar" hint="Etapa 1: login e cadastro na mesma tela." />
    </div>
  )
}
