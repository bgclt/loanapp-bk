export interface Client {
  id: number
  fullname: string
  contact: string
  email?: string
  location: string
  landmark?: string
  business?: string
  dob?: Date
  marital_status?: string
  profile_image?: string
  occupation?: string
  id_type?: string
  id_number?: string
  created_by: number
  created_at: Date
  updated_at: Date
}

export interface ClientWitness {
  id: number
  client_id: number
  fullname: string
  contact: string
  marital_status?: string
  email?: string
  occupation?: string
  residence_address?: string
  residence_gps?: string
  created_at: Date
}

export interface BusinessLocation {
  id: number
  client_id: number
  name: string
  address: string
  gps_address?: string
  region?: string
  created_at: Date
}

export interface Residence {
  id: number
  client_id: number
  name: string
  address: string
  gps_address?: string
  region?: string
  created_at: Date
}

export interface CreateClientRequest {
  fullname: string
  contact: string
  email?: string
  location: string
  landmark?: string
  business?: string
  requested_amount: number
}

export interface UpdateClientRequest {
  dob?: Date
  marital_status?: string
  profile_image?: string
  occupation?: string
  id_type?: string
  id_number?: string
  witnesses?: Omit<ClientWitness, "id" | "client_id" | "created_at">[]
  business_locations?: Omit<BusinessLocation, "id" | "client_id" | "created_at">[]
  residences?: Omit<Residence, "id" | "client_id" | "created_at">[]
}
