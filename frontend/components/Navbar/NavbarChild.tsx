'use client'
import React from 'react'
import Image from 'next/image'
import { PlusCircle, Sparkle } from '@phosphor-icons/react'
import { useModal } from '@/app/hooks/useModal'
import BasicButton from '../BasicButton'
import Link from 'next/link'

type NavbarChildProps = {
    name: string,
    avatar_url: string
}

export const NavbarChild:React.FC<NavbarChildProps> = ({ name, avatar_url }) => {

    const { setModal } = useModal()

    return (
        <div className='h-20'>
            <div className='fixed z-50 w-full border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur-xl'>
                <div className='mx-auto flex max-w-7xl items-center justify-between'>
                    <Link href='/app' className='flex items-center gap-3 transition-opacity hover:opacity-80'>
                        <div className='relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30'>
                            <svg className='h-6 w-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                            </svg>
                        </div>
                        <span className='hidden text-xl font-bold text-white sm:block'>Flowspace</span>
                    </Link>
                    
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() => setModal('Create Realm')} 
                            className='flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-cyan-500/50'
                        >
                            <span className='hidden sm:inline'>Create Space</span>
                            <span className='sm:hidden'>Create</span>
                            <PlusCircle className='h-5 w-5' weight='bold'/>
                        </button>
                        
                        <div 
                            className='flex cursor-select-none items-center gap-3 rounded-full border border-transparent px-3 py-2 pr-2 transition-all hover:border-white/20 hover:bg-white/5' 
                            onClick={() => setModal('Account Dropdown')}
                        >
                            <p className='hidden font-medium text-white sm:block'>{name}</p>
                            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 font-bold text-white shadow-lg shadow-cyan-500/30'>
                                {name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div> 
    )
}