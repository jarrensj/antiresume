import { ComponentType } from 'react'
import { User, Edit3, FileType, Share2, Wallet, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type IconType = ComponentType<{ className?: string }>

interface NavItem {
  label: string
  icon: IconType
  onClick: () => void
}

interface DashboardSidebarProps {
  sidebarOpen: boolean
  onProfileClick: () => void
  onUsernameClick: () => void
  onResumeClick: () => void
  onSocialLinksClick: () => void
  onWalletsClick: () => void
  onResetClick: () => void
}

export default function DashboardSidebar({
  sidebarOpen,
  onProfileClick,
  onUsernameClick,
  onResumeClick,
  onSocialLinksClick,
  onWalletsClick,
  onResetClick,
}: DashboardSidebarProps) {
  const navItems: NavItem[] = [
    { label: 'Profile', icon: User, onClick: onProfileClick },
    { label: 'Username', icon: Edit3, onClick: onUsernameClick },
    { label: 'Resume', icon: FileType, onClick: onResumeClick },
    { label: 'Social Links', icon: Share2, onClick: onSocialLinksClick },
    { label: 'Wallets', icon: Wallet, onClick: onWalletsClick },
  ]

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-full w-72 transform border-r border-border bg-card transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="p-6 pt-20">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Manage Profile
        </h2>

        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon, onClick }) => (
            <Button
              key={label}
              variant="ghost"
              onClick={onClick}
              className="w-full justify-start"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}

          <Separator className="my-4" />

          <Button
            variant="ghost"
            onClick={onResetClick}
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Reset Profile
          </Button>
        </nav>
      </div>
    </aside>
  )
}
