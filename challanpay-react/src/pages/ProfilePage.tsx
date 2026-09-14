import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence } from 'framer-motion'
import { User, Car, LogOut, Plus, ArrowRight } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { useUserStore } from '@/stores/userStore'
import { AddVehicleModal } from './track-status/AddVehicleModal'
import { MOCK_VEHICLES, MOCK_CHALLANS } from './track-status/mocks'

export function ProfilePage() {
  const navigate = useNavigate()
  const { userName, userMobile, setVehicleNumber, logout } = useUserStore()
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)

  const pendingByVehicle = useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of MOCK_CHALLANS) {
      if (c.status !== 'resolved') {
        map[c.vehicleNumber] = (map[c.vehicleNumber] ?? 0) + 1
      }
    }
    return map
  }, [])

  const handleCheckChallans = (vehicleNumber: string) => {
    setVehicleNumber(vehicleNumber)
    navigate(`/loading?vehicle=${encodeURIComponent(vehicleNumber)}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-xl font-bold text-text-primary">
            {userName || 'Guest User'}
          </h1>
          {userMobile && (
            <p className="text-sm text-text-secondary mt-1">+91 {userMobile}</p>
          )}
        </div>

        {/* My Vehicles */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-text-primary">My Vehicles</h2>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </button>
          </div>

          {MOCK_VEHICLES.length > 0 ? (
            <div className="space-y-5">
              {MOCK_VEHICLES.map((vehicle) => {
                const subtitle = vehicle.makeModel
                  ? `${vehicle.makeModel}${vehicle.registrationDate ? ` · ${vehicle.registrationDate.split(' ').pop()}` : ''}`
                  : '—'
                const pendingCount = pendingByVehicle[vehicle.vehicleNumber] ?? 0
                return (
                  <div
                    key={vehicle.vehicleNumber}
                    className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Car className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-base text-text-primary truncate">
                        {vehicle.vehicleNumber}
                      </p>
                      <p className="text-sm text-text-secondary truncate">{subtitle}</p>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
                        {pendingCount > 0 ? `${pendingCount} pending challans` : 'No pending challans'}
                      </span>
                      <button
                        onClick={() => handleCheckChallans(vehicle.vehicleNumber)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                      >
                        Check &amp; Pay
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <Car className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No vehicles added yet.</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <AnimatePresence>
        {showAddVehicleModal && (
          <AddVehicleModal onClose={() => setShowAddVehicleModal(false)} />
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
