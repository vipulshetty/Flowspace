import { DotsThreeVertical, Link as LinkIcon, SignIn } from '@phosphor-icons/react'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useModal } from '@/app/hooks/useModal'
import Link from 'next/link'
import { toast } from 'react-toastify'

type DesktopRealmItemProps = {
    name: string,
    id: string,
    shareId: string,
    shared?: boolean,
    playerCount?: number
}

const DesktopRealmItem:React.FC<DesktopRealmItemProps> = ({ name, id, shareId, shared, playerCount }) => {
    
    const [showMenu, setShowMenu] = useState<boolean>(false)  
    const router = useRouter()
    const menuRef = useRef<HTMLDivElement>(null)
    const dotsRef = useRef<HTMLDivElement>(null)
    const { setRealmToDelete, setModal } = useModal()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && dotsRef.current && !dotsRef.current.contains(event.target as Node)) {
                setShowMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    function handleDotsClick() {
        setShowMenu(!showMenu)
    }

    function handleDelete() {
        setRealmToDelete({ name, id })
        setModal('Delete Realm')
    }

    function getLink() {
        if (shared) {
            return `/play/${id}?shareId=${shareId}`
        } else {
            return `/play/${id}`
        }
    }

    function copyShareLink() {
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/play/${id}?shareId=${shareId}`)
        toast.success('Link copied!')
    }

    return (
        <div className='relative select-none'>
            <Link href={getLink()}>
                <div className='w-full aspect-video relative rounded-2xl border-2 border-gray-200 hover:border-emerald-400 hover:shadow-xl overflow-hidden transition-all duration-300 bg-white'>
                    {/* Background pulse animation */}
                    <div className='animate-pulse bg-gradient-to-br from-emerald-100 to-sky-100 absolute inset-0' />
                    
                    {/* Thumbnail image */}
                    <img 
                        src='/thumbnail.png' 
                        className='absolute z-10' 
                        style={{imageRendering: 'pixelated'}} 
                    />
                    
                    {/* Hover effect and sign-in icon */}
                    <div className='absolute inset-0 grid place-items-center z-20 opacity-0 hover:opacity-100 transition-opacity duration-300'>
                        <div className='rounded-full bg-emerald-500 shadow-lg grid place-items-center absolute p-3'>
                            <SignIn className='w-8 h-8 text-white' weight='bold' />
                        </div>
                    </div>
                    
                    {/* Player count indicator */}
                    {playerCount != null && (
                        <div className='pointer-events-none absolute top-3 left-3 rounded-full px-3 py-1.5 flex items-center gap-2 bg-white shadow-md max-w-max z-30'>
                            <div className='bg-emerald-500 w-2.5 h-2.5 rounded-full animate-pulse' />
                            <p className='text-sm font-medium text-gray-700'>{playerCount} online</p>
                        </div>
                    )}
                </div>
            </Link>
            <div className='mt-3 flex flex-row justify-between items-center'>
                <p className='text-lg font-bold text-gray-800'>{name}</p>
                {!shared && (
                    <div className='flex flex-row gap-1'>
                        <LinkIcon className='h-8 w-8 cursor-pointer hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 rounded-lg p-1.5 transition-colors' onClick={copyShareLink}/>
                    <div ref={dotsRef}>
                        <DotsThreeVertical weight='bold' className='h-8 w-8 cursor-pointer hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 rounded-lg p-1.5 transition-colors' onClick={handleDotsClick}/>
                    </div>
                </div>)}
            </div>
            {showMenu && (
                <div className='absolute w-40 rounded-xl bg-white shadow-xl border border-gray-200 right-0 flex flex-col z-10 overflow-hidden' ref={menuRef}>
                    <button className='py-3 px-4 w-full hover:bg-emerald-50 text-left text-gray-700 hover:text-emerald-700 font-medium transition-colors' onClick={() => router.push(`/editor/${id}`)}>
                        Edit Map
                    </button>
                    <button className='py-3 px-4 w-full hover:bg-emerald-50 text-left text-gray-700 hover:text-emerald-700 font-medium transition-colors border-t border-gray-100' onClick={() => router.push(`/manage/${id}`)}>Manage</button>
                    <button className='py-3 px-4 w-full hover:bg-red-500 hover:text-white text-left text-gray-700 font-medium transition-colors border-t border-gray-100' onClick={handleDelete}>Delete</button>
                </div>
            )}
        </div>
    )
}

export default DesktopRealmItem