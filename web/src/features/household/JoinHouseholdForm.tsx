import { Button } from '../../components/Button'
import { PlaceholderPage } from '../../components/PlaceholderPage'

export function JoinHouseholdForm() {
  return (
    <section className="w-full">
      <PlaceholderPage
        title="Join a household"
        description="Enter the join code your family shared with you (task 5)."
      />
      <div className="px-4">
        <Button variant="secondary" disabled className="w-full">
          Join
        </Button>
      </div>
    </section>
  )
}
