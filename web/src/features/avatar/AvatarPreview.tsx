import type { AvatarConfig } from '../../types/models'

interface AvatarPreviewProps {
  config: AvatarConfig
  size?: number
}

export function AvatarPreview({ size = 64 }: AvatarPreviewProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className="bg-brand-100 text-brand-700 flex items-center justify-center rounded-full text-xs font-bold"
    >
      SVG avatar (task 6)
    </div>
  )
}
