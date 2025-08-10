import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({children}: AuthLayoutProps) => {
  return (
    <div className='flex justify-center items-center bg-slate-200 p-10 rounded-md'>
      {children}
    </div>
  )
}

export default AuthLayout;
