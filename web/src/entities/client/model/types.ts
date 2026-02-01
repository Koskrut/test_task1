export interface Client {
  id: string
  name: string
  companyName?: string | null
  email?: string | null
  phone?: string | null
  status?: string | null
  assignedManagerId?: string | null
}
