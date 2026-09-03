import { Button } from '../../components/Button'
import { PlaceholderPage } from '../../components/PlaceholderPage'

export function CreateHouseholdForm() {
  return (
    <section className="w-full">
      <PlaceholderPage
        title="Create a household"
        description="Name your home and set default points per task (task 5)."
      />
      <div className="px-4">
        <Button disabled className="w-full">
          Create
        </Button>
      </div>
    </section>
  )
}
