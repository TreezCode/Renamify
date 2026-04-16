'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { ProjectsLibrary } from '@/components/dashboard/ProjectsLibrary'

export default function ProjectsPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  if (!userId) return null

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ProjectsLibrary userId={userId} />
      </div>
    </div>
  )
}
