import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import React from 'react'

const page = async () => {
  const session = await getServerSession(authOptions);
  console.log("Session:", session);
  
  if (session?.user){
    return (
      <div className="text-2xl">Admin page - welcome back {session.user.username || session.user.name}</div>
    )
  }
  return (
    <div className='text-2xl'>
      please login to see this admin page
    </div>
  )
}

export default page
