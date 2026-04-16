import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile for display name
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <DashboardLayout
      user={{
        email: user.email || '',
        full_name: profile?.full_name || undefined,
      }}
    >
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <DashboardOverview
          userId={user.id}
          userName={profile?.full_name || user.email?.split('@')[0]}
        />
      </div>
    </DashboardLayout>
  )
}
