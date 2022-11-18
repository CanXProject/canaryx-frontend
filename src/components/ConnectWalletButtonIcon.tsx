import React from 'react'
import { Button, useWalletModal } from 'canaryx-uikit'
import useAuth from 'hooks/useAuth'
import { useTranslation } from 'contexts/Localization'

const DisconnectedWalletIcon = (props) => {
  const { t } = useTranslation()
  const { login, logout } = useAuth()
  const { onPresentConnectModal } = useWalletModal(login, logout, t)

  const handleClick = () => {
    onPresentConnectModal()
  }

  return (
    // <div style={{ paddingRight: 24 }} >
    <Button
      onClick={onPresentConnectModal}
      {...props}
      style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}
      id="Wallet-Button"
    >
      {/* {t('Connect Wallet')} */}
      <img src="/images1/icons/icon-wallet-disconnected.svg" alt="ConnectWallet" style={{ cursor: 'pointer' }} />
    </Button>
    // </div>
  )
}

export default DisconnectedWalletIcon
