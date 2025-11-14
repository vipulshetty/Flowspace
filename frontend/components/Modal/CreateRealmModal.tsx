'use client'
import React, { useState } from 'react'
import Modal from './Modal'
import { useModal } from '@/app/hooks/useModal'
import BasicButton from '../BasicButton'
import { createClient } from '@/utils/auth/client'
import { postRequest } from '@/utils/backend/requests'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation' 
import revalidate from '@/utils/revalidate'
import defaultOfficeTemplate from '@/utils/defaultOfficeTemplate.json'

const CreateRealmModal:React.FC = () => {
    
    const { modal, setModal } = useModal()
    const [loading, setLoading] = useState<boolean>(false)

    const router = useRouter()

    async function createRealm() {
        const authClient = createClient()
        const { data } = await authClient.getUser()

        if (!data?.user) {
            toast.error('You must be logged in to create a virtual office')
            return
        }

        setLoading(true)

        const realmData: any = {
            name: 'My Virtual Office',
            map_data: defaultOfficeTemplate
        }

        const token = authClient.getToken()
        const { data: responseData, error } = await postRequest('realms', realmData, token || undefined)

        if (error) {
            toast.error(error?.error || 'Failed to create virtual office')
        } 

        if (responseData) {
            revalidate('/app')
            setModal('None')
            toast.success('Your virtual office has been created!')
            router.push(`/play/${responseData.realm.id}?shareId=${responseData.realm.share_id}`)
        }

        setLoading(false)
    }

    return (
        <Modal open={modal === 'Create Realm'} closeOnOutsideClick>
            <div className='flex flex-col items-center p-8 w-[500px] gap-6'>
                <h1 className='text-3xl font-bold'>Create Your Virtual Office</h1>
                <p className='text-center text-gray-600'>
                    Your virtual office will include 5 predefined zones that you can customize:
                </p>
                <div className='flex flex-col gap-2 w-full'>
                    <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg'>
                        <span className='text-2xl'>🚪</span>
                        <span className='font-semibold'>Lobby</span>
                    </div>
                    <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg'>
                        <span className='text-2xl'>💼</span>
                        <span className='font-semibold'>Main Office</span>
                    </div>
                    <div className='flex items-center gap-3 p-3 bg-purple-50 rounded-lg'>
                        <span className='text-2xl'>👥</span>
                        <span className='font-semibold'>Meeting Room</span>
                    </div>
                    <div className='flex items-center gap-3 p-3 bg-yellow-50 rounded-lg'>
                        <span className='text-2xl'>☕</span>
                        <span className='font-semibold'>Cafeteria</span>
                    </div>
                    <div className='flex items-center gap-3 p-3 bg-pink-50 rounded-lg'>
                        <span className='text-2xl'>🎮</span>
                        <span className='font-semibold'>Chill/Game Room</span>
                    </div>
                </div>
                <BasicButton disabled={loading} onClick={createRealm} className='text-lg w-full'>
                    {loading ? 'Creating...' : 'Create Virtual Office'}
                </BasicButton>
            </div>
        </Modal>
    )
}

export default CreateRealmModal