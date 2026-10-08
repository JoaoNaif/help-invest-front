import { ImagePlus, X } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import type { PreparedImage } from '../image'

type Props = {
  text: string
  onTextChange: (text: string) => void
  image: PreparedImage | null
  onImageFile: (file: File) => void
  onClearImage: () => void
  error?: string
}

/** Área principal de entrada: Ctrl+V de print (tratado na página), arrastar imagem, escolher arquivo ou colar texto. */
export function PasteArea({ text, onTextChange, image, onImageFile, onClearImage, error }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)

    const file = Array.from(event.dataTransfer.files).find((f) => f.type.startsWith('image/'))
    if (file) onImageFile(file)
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-4 transition-colors sm:p-5 ${
          dragging ? 'border-gold bg-gold/5' : error ? 'border-danger' : 'border-border bg-surface'
        }`}
      >
        {image ? (
          <div className="relative">
            <img
              src={image.previewUrl}
              alt="Print colado"
              className="max-h-80 w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={onClearImage}
              aria-label="Remover imagem"
              className="absolute top-2 right-2 grid size-9 cursor-pointer place-items-center rounded-full bg-bg/80 text-text backdrop-blur hover:bg-bg"
            >
              <X className="size-4" aria-hidden />
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              O print é enviado só para leitura e não é armazenado.
            </p>
          </div>
        ) : (
          <>
            <label htmlFor="paste-text" className="sr-only">
              Texto das opções
            </label>
            <textarea
              id="paste-text"
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              rows={7}
              maxLength={20000}
              placeholder="Cole aqui o print (Ctrl+V) ou o texto com as opções de CDB, LCI, LCA..."
              className="w-full resize-y bg-transparent text-base text-text placeholder:text-muted/70 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted">
              <span>Também dá para arrastar uma imagem para cá.</span>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text hover:bg-surface-2"
              >
                <ImagePlus className="size-4" aria-hidden />
                Escolher imagem
              </button>
            </div>
          </>
        )}

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onImageFile(file)
            event.target.value = ''
          }}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
