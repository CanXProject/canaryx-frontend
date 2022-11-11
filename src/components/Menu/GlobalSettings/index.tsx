import React from 'react'
import { Flex, IconButton, CogIcon, useModal } from 'canaryx-uikit'
import SettingsModal from './SettingsModal'

type Props = {
  color?: string
  mr?: string
}

const GlobalSettings = ({ color, mr = '8px' }: Props) => {
  const [onPresentSettingsModal] = useModal(<SettingsModal />)

  return (
    <Flex>
      <IconButton onClick={onPresentSettingsModal} variant="text" scale="sm" mr={mr} id="open-settings-dialog-button">
        {/* <CogIcon height={24} width={24} color={color || 'textSubtle'} /> */}
        <img src='/images1/icons/icon-setting.svg' alt='CogIcon' style={{height: 24, width: 24}}/>
      </IconButton>
    </Flex>
  )
}

export default GlobalSettings
