import { Button } from '../../components/Button'
import { AvatarBuilder } from '../../features/avatar/AvatarBuilder'
import { useAppMock } from '../mockState'

export function AvatarPage() {
  const { avatarConfig, setAvatarConfig } = useAppMock()

  return (
    <div className="space-y-5">
      <AvatarBuilder value={avatarConfig} onChange={setAvatarConfig} />
      <Button className="w-full">Save mock avatar</Button>
    </div>
  )
}
