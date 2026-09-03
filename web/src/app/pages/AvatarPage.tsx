import { Button } from '../../components/Button'
import { AvatarBuilder } from '../../features/avatar/AvatarBuilder'
import { useAppMock } from '../mockState'

export function AvatarPage() {
  const { avatarConfig, setAvatarConfig, saveAvatar, avatarSaving } = useAppMock()

  return (
    <div className="space-y-5">
      <AvatarBuilder value={avatarConfig} onChange={setAvatarConfig} />
      <Button
        className="w-full"
        disabled={avatarSaving}
        onClick={() => void saveAvatar(avatarConfig)}
      >
        {avatarSaving ? 'Saving...' : 'Save avatar'}
      </Button>
    </div>
  )
}