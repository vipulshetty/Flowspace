import React from 'react'
import { createClient } from '@/utils/auth/server'
import { NavbarChild } from './NavbarChild'
import { formatEmailToName } from '@/utils/formatEmailToName'

export const Navbar:React.FC = async () => {

    const authClient = createClient()

    const { data: { user } } = await authClient.auth.getUser()

    const name = formatEmailToName(user?.email ?? '')
    // try to read an avatar from user metadata if available, otherwise use empty string
    const avatar = (user as any)?.user_metadata?.avatar_url ?? ''

    return (
        <NavbarChild name={name} avatar_url={avatar} />
    )
}
