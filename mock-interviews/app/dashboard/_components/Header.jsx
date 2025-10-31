import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import React from 'react'

const Header = () => {
  return (
    <div className='p-3 flex justify-between items-center bg-linear-to-b from-gray-300 via-bg-gray-200 to bg-gray-100 shadow-lg'>
      <Image src={'/logo.svg'} alt='logo' width={45} height={45} />
      <ul className='flex items-center gap-16'>
        <li className='cursor-pointer font-semibold text-md font-sans tracking-wide hover:text-blue-700 hover:underline hover:underline-offset-8 hover:scale-105'>
          Dashboard
        </li>
        <li className='cursor-pointer font-semibold text-md font-sans tracking-wide hover:text-blue-700 hover:underline hover:underline-offset-8 hover:scale-105'>
          Questions
        </li>
        <li className='cursor-pointer font-semibold text-md font-sans tracking-wide hover:text-blue-700 hover:underline hover:underline-offset-8 hover:scale-105'>
          Upgrade
        </li>
        <li className='cursor-pointer font-semibold text-md font-sans tracking-wide hover:text-blue-700 hover:underline hover:underline-offset-8 hover:scale-105'>
          How it Works?
        </li>
      </ul>
      <UserButton
      appearance={{
        elements: {
          avatarBox: "w-14 h-14",        
          userButtonPopoverCard: "rounded-xl shadow-lg", 
        },
      }}
      />

    </div>
  )
}

export default Header
