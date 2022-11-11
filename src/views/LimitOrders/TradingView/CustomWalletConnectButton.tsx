import React from 'react'
import { Button, useWalletModal } from 'canaryx-uikit'
import useAuth from 'hooks/useAuth'
import { useTranslation } from 'contexts/Localization'
import { CustomOrderButton } from '../styles'

export const CustomWalletConnectButton = (props : any) => {
    const { t } = useTranslation()
    const { login, logout } = useAuth()
    const { onPresentConnectModal } = useWalletModal(login, logout, t)

    return (
        <CustomOrderButton onClick={onPresentConnectModal} {...props}>
            {t('Connect Wallet')}
        </CustomOrderButton>
    )
}

export const CustomWalletConnectedButton = (props : any) => {
    const { t } = useTranslation()
    return (
        <CustomOrderButton {...props}>
            {t('Connected')}
        </CustomOrderButton>
    )
}