import styled from 'styled-components'
import { Flex } from 'canaryx-uikit'

interface StickerProps {
  backgroundColor?: string
  borderColor?: string
}

const Sticker = styled(Flex)<StickerProps>`
  width: 100%;
  height: 100%;
  background-color: ${({ theme, backgroundColor }) => backgroundColor || theme.colors.invertedContrast};
  border: 2px solid ${({ theme, borderColor }) => borderColor || theme.colors.invertedContrast};
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.card.boxShadow};
`

export default Sticker
