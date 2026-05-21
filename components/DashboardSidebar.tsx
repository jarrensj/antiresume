import { ComponentType } from 'react'
import { User, Edit3, FileType, Share2, Wallet, ImageIcon, Trash2 } from 'lucide-react'

type IconType = ComponentType<{ className?: string }>

interface NavItem {
  label: string
  icon: IconType
  onClick: () => void
  variant?: 'danger'
}

interface DashboardSidebarProps {
  sidebarOpen: boolean
  onProfileClick: () => void
  onUsernameClick: () => void
  onResumeClick: () => void
  onSocialLinksClick: () => void
  onWalletsClick: () => void
  onPhotosClick: () => void
  onResetClick: () => void
}

export default function DashboardSidebar({
  sidebarOpen,
  onProfileClick,
  onUsernameClick,
  onResumeClick,
  onSocialLinksClick,
  onWalletsClick,
  onPhotosClick,
  onResetClick,
}: DashboardSidebarProps) {
  const navItems: NavItem[] = [
    { label: 'Profile', icon: User, onClick: onProfileClick },
    { label: 'Username', icon: Edit3, onClick: onUsernameClick },
    { label: 'Resume', icon: FileType, onClick: onResumeClick },
    { label: 'Photo Gallery', icon: ImageIcon, onClick: onPhotosClick },
    { label: 'Social Links', icon: Share2, onClick: onSocialLinksClick },
    { label: 'Wallets', icon: Wallet, onClick: onWalletsClick },
  ]

  const buttonBaseClasses =
    'w-full px-3 py-2.5 rounded-xl transition-colors duration-200 text-left text-charcoal-600 hover:text-charcoal-800'
  const buttonHoverClasses = 'hover:bg-sage-50'
  const dangerClasses =
    'text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200'

  return (
    <div
      className={`fixed top-0 left-0 h-full w-72 bg-matcha-cream border-r-2 border-sage-300 z-40 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-6 pt-20">
        <h2 className="text-lg font-noto font-semibold text-charcoal-800 mb-5 tracking-tight">
          Manage Profile
        </h2>

        <nav className="space-y-1.5">
          {navItems.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`${buttonBaseClasses} ${buttonHoverClasses}`}
            >
              <span className="w-full inline-flex items-center gap-2.5">
                <Icon className="w-4 h-4 flex-shrink-0 text-sage-600" />
                <span className="font-medium text-sm tracking-tight">{label}</span>
              </span>
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-sage-200">
            <button
              onClick={onResetClick}
              className={`w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium ${dangerClasses}`}
            >
              <span className="w-full inline-flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span className="tracking-tight">Reset Profile</span>
              </span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}
