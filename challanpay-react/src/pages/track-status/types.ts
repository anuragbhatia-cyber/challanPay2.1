export type TrackingStatus = 'not-settled' | 'in-progress' | 'resolved' | 'refund'
export type FilterTab = 'all' | 'in-progress' | 'resolved' | 'refund'
export type SidebarTab = 'challan' | 'vehicle'
export type LoginStep = 'details' | 'otp'

export interface TimelineEntry {
  date: string
  title: string
  description?: string
}

export interface TrackingChallan {
  id: string
  challanNumber: string
  status: TrackingStatus
  vehicleNumber: string
  incidentId: string
  amount: number
  resolutionDate: string
  timeline: TimelineEntry[]
  isExpress?: boolean
}

export interface VehicleInfo {
  vehicleNumber: string
  ownerName: string
  fatherName: string
  address: string
  vehicleType: string
  registrationDate: string
  makeModel: string
  vehicleTypeColor: string
  engineNumber: string
  chassisNumber: string
  pucExpiry: string
  insuranceExpiry: string
  rcExpiry: string
}
