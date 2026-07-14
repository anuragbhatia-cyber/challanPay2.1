import { AlertCircle, ArrowLeft, CircleCheck, Hourglass } from 'lucide-react'
import type { TrackingChallan, TrackingStatus, VehicleInfo } from './types'

export const MOCK_CHALLANS: TrackingChallan[] = [
  {
    id: '1',
    challanNumber: 'UP4083823062711437',
    status: 'resolved',
    vehicleNumber: 'UP32 GJ 4083',
    incidentId: 'IRN-4680065',
    amount: 0,
    resolutionDate: '20 Nov, 2024',
    isExpress: true,
    timeline: [
      { date: '06 Nov, 02:22 PM', title: 'Challan Submitted', description: 'Your challan has been submitted for processing. Our team will review it shortly.' },
    ],
  },
  {
    id: '2',
    challanNumber: 'UP4083823062711438',
    status: 'not-settled',
    vehicleNumber: 'UP32 GJ 4083',
    incidentId: 'IRN-4679986',
    amount: 500,
    resolutionDate: '22 Nov, 2024',
    timeline: [
      { date: '05 Nov, 11:30 AM', title: 'Challan Submitted', description: 'Your challan has been submitted for processing.' },
      { date: '05 Nov, 04:00 PM', title: 'Payment Pending', description: 'Awaiting payment confirmation from the authority.' },
    ],
  },
  {
    id: '3',
    challanNumber: 'UP4083823062711439',
    status: 'in-progress',
    vehicleNumber: 'UP32 GJ 4083',
    incidentId: 'IRN-4679900',
    amount: 1000,
    resolutionDate: '25 Nov, 2024',
    isExpress: true,
    timeline: [
      { date: '04 Nov, 09:15 AM', title: 'Challan Submitted', description: 'Your challan has been submitted for processing.' },
      { date: '04 Nov, 02:00 PM', title: 'Under Review', description: 'Challan is being reviewed by our resolution team.' },
      { date: '05 Nov, 11:00 AM', title: 'Resolution In Progress', description: 'Our team is actively working on resolving this challan with the traffic authority.' },
    ],
  },
  {
    id: '4',
    challanNumber: 'UP4083823062711440',
    status: 'in-progress',
    vehicleNumber: 'UP32 GJ 4083',
    incidentId: 'IRN-4679850',
    amount: 2000,
    resolutionDate: '28 Nov, 2024',
    timeline: [
      { date: '03 Nov, 10:00 AM', title: 'Challan Submitted', description: 'Your challan has been submitted for processing.' },
      { date: '03 Nov, 05:30 PM', title: 'Documents Requested', description: 'Additional documents requested for verification.' },
      { date: '04 Nov, 09:00 AM', title: 'Documents Uploaded', description: 'Documents have been uploaded and are pending review.' },
      { date: '05 Nov, 02:00 PM', title: 'Resolution In Progress', description: 'Resolution process initiated with traffic department.' },
    ],
  },
  {
    id: '5',
    challanNumber: 'UP4083823062711441',
    status: 'not-settled',
    vehicleNumber: 'UP32 GJ 4083',
    incidentId: 'IRN-4679801',
    amount: 0,
    resolutionDate: '30 Nov, 2024',
    timeline: [
      { date: '02 Nov, 08:45 AM', title: 'Challan Submitted', description: 'Your challan has been submitted for processing.' },
    ],
  },
  {
    id: '6',
    challanNumber: 'UP4083823062711442',
    status: 'not-settled',
    vehicleNumber: 'UP32 GJ 4083',
    incidentId: 'IRN-4679750',
    amount: 750,
    resolutionDate: '02 Dec, 2024',
    timeline: [
      { date: '01 Nov, 04:30 PM', title: 'Challan Submitted', description: 'Your challan has been submitted for processing.' },
      { date: '02 Nov, 10:00 AM', title: 'Under Review', description: 'Challan is being reviewed by our resolution team.' },
    ],
  },
]

export const MOCK_VEHICLES: VehicleInfo[] = [
  {
    vehicleNumber: 'UP32 GJ 4083',
    ownerName: 'Anurag Bhatia',
    fatherName: 'Rajesh Bhatia',
    address: '45, Sector 12, Noida, Uttar Pradesh - 201301',
    vehicleType: 'Car',
    registrationDate: '15 Mar 2020',
    makeModel: 'Hyundai Creta SX',
    vehicleTypeColor: 'White',
    engineNumber: 'G4NAHU456789',
    chassisNumber: 'MALC381CJKM12345',
    pucExpiry: '22 Dec 2025',
    insuranceExpiry: '14 Mar 2026',
    rcExpiry: '15 Mar 2035',
  },
  {
    vehicleNumber: 'DL01 AB 1234',
    ownerName: 'Anurag Bhatia',
    fatherName: 'Rajesh Bhatia',
    address: '45, Sector 12, Noida, Uttar Pradesh - 201301',
    vehicleType: 'Bike',
    registrationDate: '22 Jun 2019',
    makeModel: 'Royal Enfield Classic 350',
    vehicleTypeColor: 'Black',
    engineNumber: 'JBSBBH78901',
    chassisNumber: 'ME3J1AG11KC23456',
    pucExpiry: '10 Aug 2025',
    insuranceExpiry: '21 Jun 2026',
    rcExpiry: '22 Jun 2034',
  },
]

export const STATUS_BADGE: Record<TrackingStatus, { label: string; className: string; icon: typeof CircleCheck }> = {
  'not-settled': { label: 'NOT SETTLED', className: 'bg-gray-100 text-gray-600', icon: AlertCircle },
  'in-progress': { label: 'IN PROGRESS', className: 'bg-amber-50 text-amber-600', icon: Hourglass },
  'resolved': { label: 'CLOSED', className: 'bg-emerald-50 text-emerald-600', icon: CircleCheck },
  'refund': { label: 'REFUND', className: 'bg-purple-50 text-purple-600', icon: ArrowLeft },
}
