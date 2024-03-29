import React from 'react'
import styled from 'styled-components'
import { Card } from 'canaryx-uikit'

export const BodyWrapper = styled(Card)`
  border-radius: 4px;
  width: 328px;
  ${({ theme }) => theme.mediaQueries.md} {
    width: 550px;
  }
  z-index: 1;
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}
