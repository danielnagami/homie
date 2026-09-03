import type { ReactNode } from 'react'
import type { AvatarConfig } from '../../types/models'
import { Button } from '../../components/Button'
import { AvatarPreview } from './AvatarPreview'

interface AvatarBuilderProps {
  value: AvatarConfig
  onChange: (config: AvatarConfig) => void
  stepLabel?: string
}

const skinTones = ['#ffdad4', '#fed2b8', '#e4aa83', '#ad6d47', '#67402c']
const hairStyles = [
  { id: 'buns', label: 'Twin Buns', icon: '🍡' },
  { id: 'bob', label: 'Sweet Bob', icon: '✂️' },
  { id: 'pixie', label: 'Pixie Cut', icon: '✨' },
]
const hairColors = ['#ff7e67', '#9a8cff', '#edc157', '#44312b', '#007346']
const faces = [
  { id: 'wink', label: 'Wink', icon: '😉' },
  { id: 'grin', label: 'Big Grin', icon: '😄' },
  { id: 'chill', label: 'Chill', icon: '😊' },
]
const outfits = [
  { id: '#95f7bb', label: 'Mint Hoodie' },
  { id: '#ffb4a6', label: 'Coral Tee' },
  { id: '#ffdf9b', label: 'Honey Knit' },
  { id: '#bdb2ff', label: 'Lavender Vest' },
]

export function AvatarBuilder({ value, onChange, stepLabel = 'Step 2 of 2' }: AvatarBuilderProps) {
  function update(patch: Partial<AvatarConfig>) {
    onChange({ ...value, ...patch })
  }

  function randomize() {
    update({
      skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
      hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)].id,
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      face: faces[Math.floor(Math.random() * faces.length)].id,
      outfit: outfits[Math.floor(Math.random() * outfits.length)].id,
      accessory: Math.random() > 0.35 ? 'star' : undefined,
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-xs font-extrabold uppercase tracking-wider text-coral-400">{stepLabel}</p>
          <h1 className="font-display text-3xl font-extrabold text-ink">Build your Homie</h1>
        </div>
        <span className="rounded-full bg-honey-100 px-3 py-1 font-display text-xs font-extrabold text-honey-700">Homie Pass</span>
      </div>

      <div className="relative mx-auto grid aspect-square max-w-[280px] place-items-center rounded-full bg-white p-4 shadow-soft">
        <div className="absolute inset-5 rounded-full bg-gradient-to-tr from-coral-100 via-mint-100 to-honey-100 blur-xl" />
        <div className="relative grid h-full w-full place-items-center rounded-full bg-lavender-100">
          <AvatarPreview config={value} size={210} />
        </div>
        <Button variant="secondary" onClick={randomize} className="absolute -bottom-3 min-h-10 bg-white px-4">
          Surprise Me
        </Button>
      </div>

      <Picker title="Skin Radiance">
        {skinTones.map((tone) => (
          <button
            key={tone}
            type="button"
            onClick={() => update({ skinTone: tone })}
            className={`grid h-12 w-12 place-items-center rounded-full bg-lavender-200 transition-transform active:scale-95 ${value.skinTone === tone ? 'ring-4 ring-coral-200' : ''}`}
          >
            <span className="h-8 w-8 rounded-full shadow-sm" style={{ backgroundColor: tone }} />
          </button>
        ))}
      </Picker>

      <Picker title="Hair Style">
        {hairStyles.map((style) => (
          <Choice
            key={style.id}
            active={value.hairStyle === style.id}
            onClick={() => update({ hairStyle: style.id })}
            label={style.label}
            icon={style.icon}
          />
        ))}
      </Picker>

      <Picker title="Hair Dye">
        {hairColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => update({ hairColor: color })}
            className={`grid h-11 w-11 place-items-center rounded-full bg-lavender-200 transition-transform active:scale-95 ${value.hairColor === color ? 'ring-4 ring-coral-200' : ''}`}
          >
            <span className="h-8 w-8 rounded-full shadow-sm" style={{ backgroundColor: color }} />
          </button>
        ))}
      </Picker>

      <Picker title="Expression">
        {faces.map((face) => (
          <Choice
            key={face.id}
            active={value.face === face.id}
            onClick={() => update({ face: face.id })}
            label={face.label}
            icon={face.icon}
          />
        ))}
      </Picker>

      <Picker title="Outfit">
        {outfits.map((outfit) => (
          <button
            key={outfit.id}
            type="button"
            onClick={() => update({ outfit: outfit.id })}
            className={`rounded-2xl px-3 py-2 font-display text-xs font-extrabold shadow-card transition-transform active:scale-95 ${value.outfit === outfit.id ? 'bg-coral-100 text-coral-700 ring-2 ring-coral-300' : 'bg-white text-pebble'}`}
          >
            <span className="mr-2 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: outfit.id }} />
            {outfit.label}
          </button>
        ))}
      </Picker>
    </section>
  )
}

function Picker({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-4xl bg-white p-4 shadow-card">
      <h2 className="mb-3 font-display text-sm font-extrabold uppercase tracking-wider text-pebble">{title}</h2>
      <div className="flex gap-2 overflow-x-auto pb-1">{children}</div>
    </section>
  )
}

function Choice({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-24 rounded-3xl px-4 py-3 text-center shadow-card transition-transform active:scale-95 ${active ? 'bg-coral-400 text-white' : 'bg-lavender-100 text-ink'}`}
    >
      <span className="block text-xl">{icon}</span>
      <span className="font-display text-xs font-extrabold">{label}</span>
    </button>
  )
}
