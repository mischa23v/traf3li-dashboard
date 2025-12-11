import { useOrganizationsContext } from './organizations-provider'

export function OrganizationsDialogs() {
  const { open } = useOrganizationsContext()

  if (!open) return null

  return null
}
