export interface HomeLocation {
  label: string
  timeZone: string
}

// The IANA time zone is the source of truth. The label is kept separately so a
// household can show the city the creator selected without deriving it later.
export const homeLocations: HomeLocation[] = [
  { label: 'São Paulo / Brasília, Brazil', timeZone: 'America/Sao_Paulo' },
  { label: 'Manaus, Brazil', timeZone: 'America/Manaus' },
  { label: 'Cuiabá, Brazil', timeZone: 'America/Cuiaba' },
  { label: 'Rio Branco, Brazil', timeZone: 'America/Rio_Branco' },
  { label: 'Fernando de Noronha, Brazil', timeZone: 'America/Noronha' },
  { label: 'Buenos Aires, Argentina', timeZone: 'America/Argentina/Buenos_Aires' },
  { label: 'New York, United States', timeZone: 'America/New_York' },
  { label: 'Chicago, United States', timeZone: 'America/Chicago' },
  { label: 'Los Angeles, United States', timeZone: 'America/Los_Angeles' },
  { label: 'London, United Kingdom', timeZone: 'Europe/London' },
  { label: 'Lisbon, Portugal', timeZone: 'Europe/Lisbon' },
  { label: 'Paris, France', timeZone: 'Europe/Paris' },
  { label: 'Dubai, United Arab Emirates', timeZone: 'Asia/Dubai' },
  { label: 'Singapore', timeZone: 'Asia/Singapore' },
  { label: 'Tokyo, Japan', timeZone: 'Asia/Tokyo' },
  { label: 'Sydney, Australia', timeZone: 'Australia/Sydney' },
  { label: 'UTC', timeZone: 'UTC' },
]

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone })
    return true
  } catch {
    return false
  }
}

export function defaultHomeLocation(): HomeLocation {
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const knownLocation = homeLocations.find((location) => location.timeZone === browserTimeZone)
  if (knownLocation) return knownLocation

  return isValidTimeZone(browserTimeZone)
    ? { label: `Local time (${browserTimeZone})`, timeZone: browserTimeZone }
    : homeLocations[0]
}
