import type { AvatarConfig } from '../../types/models'

interface AvatarPreviewProps {
  config: AvatarConfig
  size?: number
  label?: string
}

export function AvatarPreview({ config, size = 96, label }: AvatarPreviewProps) {
  const skin = config.skinTone || '#ffdad4'
  const hair = config.hairColor || '#ff7e67'
  const outfit = config.outfit || '#95f7bb'
  const showBuns = config.hairStyle === 'buns'
  const showStar = config.accessory === 'star'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        role="img"
        aria-label={label || 'Homie avatar'}
        className="drop-shadow-[0_8px_14px_rgba(45,49,66,0.16)]"
      >
        <ellipse cx="100" cy="182" fill="#171b2b" fillOpacity="0.08" rx="42" ry="7" />
        <path d="M68 142C68 128 78 120 100 120C122 120 132 128 132 142L138 180H62L68 142Z" fill={outfit} />
        <path d="M84 121C88 132 112 132 116 121" stroke="#007346" strokeLinecap="round" strokeWidth="3" />
        <circle cx="58" cy="98" fill={skin} r="9" />
        <circle cx="142" cy="98" fill={skin} r="9" />
        <rect fill={skin} height="74" rx="36" width="82" x="59" y="58" />
        <path
          d={
            config.hairStyle === 'pixie'
              ? 'M62 75C66 50 83 39 105 41C123 43 139 55 138 79C121 63 94 65 78 84C72 87 65 84 62 75Z'
              : config.hairStyle === 'bob'
                ? 'M58 82C58 50 77 38 100 38C123 38 142 50 142 82L135 123H65L58 82Z'
                : 'M60 76C60 48 78 38 100 38C122 38 140 48 140 76C140 85 136 94 133 94C128 78 120 74 114 74C108 74 104 78 100 83C96 78 92 74 86 74C80 74 72 78 67 94C64 94 60 85 60 76Z'
          }
          fill={hair}
        />
        {showBuns && (
          <>
            <circle cx="61" cy="46" fill={hair} r="14" />
            <circle cx="139" cy="46" fill={hair} r="14" />
          </>
        )}
        {showStar && <polygon fill="#ffdf9b" points="66,54 69,60 76,61 71,66 72,73 66,69 60,73 61,66 56,61 63,60" />}
        <ellipse cx="73" cy="104" fill="#ff7e67" fillOpacity="0.45" rx="6" ry="3.5" />
        <ellipse cx="127" cy="104" fill="#ff7e67" fillOpacity="0.45" rx="6" ry="3.5" />
        {config.face === 'chill' ? (
          <>
            <path d="M73 91C77 95 81 95 85 91" stroke="#3f0300" strokeLinecap="round" strokeWidth="3" />
            <path d="M115 91C119 95 123 95 127 91" stroke="#3f0300" strokeLinecap="round" strokeWidth="3" />
            <path d="M93 104C98 108 102 108 107 104" stroke="#3f0300" strokeLinecap="round" strokeWidth="2.5" />
          </>
        ) : config.face === 'grin' ? (
          <>
            <circle cx="78" cy="91" fill="#3f0300" r="5" />
            <circle cx="122" cy="91" fill="#3f0300" r="5" />
            <path d="M90 103C96 114 107 114 112 103" fill="#ff7e67" stroke="#3f0300" strokeLinecap="round" strokeWidth="2.5" />
          </>
        ) : (
          <>
            <path d="M71 91C74 88 80 88 83 91" stroke="#3f0300" strokeLinecap="round" strokeWidth="3" />
            <circle cx="121" cy="91" fill="#3f0300" r="5.5" />
            <circle cx="119.5" cy="89.5" fill="#ffffff" r="2" />
            <path d="M93 103C95 110 105 110 107 103" fill="#ff7e67" stroke="#3f0300" strokeLinecap="round" strokeWidth="2.5" />
          </>
        )}
      </svg>
      {label && <span className="font-display text-xs font-extrabold text-pebble">{label}</span>}
    </div>
  )
}
