import React from 'react'
import { Button, useWalletModal } from '@pancakeswap/uikit'
import useAuth from 'hooks/useAuth'
import { useTranslation } from 'contexts/Localization'
import { CustomOrderButton } from '../styles'

const CustomWalletConnectButton = (props) => {
    const { t } = useTranslation()
    const { login, logout } = useAuth()
    const { onPresentConnectModal } = useWalletModal(login, logout, t)

    const handleClick = () => {
        onPresentConnectModal();
    }

    return (
        <CustomOrderButton onClick={onPresentConnectModal} {...props}>
            {t('Connect Wallet')}
        </CustomOrderButton>
    )
}

export default CustomWalletConnectButton
