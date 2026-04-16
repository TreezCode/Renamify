import { createClient } from '@/lib/supabase/server'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Auth check is in layout.tsx
  if (!user) return null

  // Get user profile for display name
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardOverview
          userId={user.id}
          userName={profile?.full_name || user.email?.split('@')[0]}
        />
      </div>
    </div>
  )
}
