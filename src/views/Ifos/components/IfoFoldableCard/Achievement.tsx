import React from 'react'
import styled from 'styled-components'
import { Flex, LinkExternal, Image, Text, Skeleton } from 'canaryx-uikit'
import tokens from 'config/constants/tokens'
import { useTranslation } from 'contexts/Localization'
import { PublicIfoData } from 'views/Ifos/types'
import { Ifo } from 'config/constants/types'
import { BIG_TEN } from 'utils/bigNumber'
import { getBscScanLink } from 'utils'
import { formatBigNumber } from 'utils/formatBalance'

const FIXED_MIN_DOLLAR_FOR_ACHIEVEMENT = BIG_TEN

interface Props {
  ifo: Ifo
  publicIfoData: PublicIfoData
}

const Container = styled(Flex)`
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
    align-items: initial;
  }
`

const AchievementFlex = styled(Flex)<{ isFinished: boolean }>`
  ${({ isFinished }) => (isFinished ? 'filter: grayscale(100%)' : '')};
`

const StyledLinkExternal = styled(LinkExternal)`
  margin-top: 8px;
  ${({ theme }) => theme.mediaQueries.md} {
    margin-top: 0;
  }
`

const Achievement: React.FC<Props> = ({ ifo, publicIfoData }) => {
  const { t } = useTranslation()
  // const tokenName = ifo.token.symbol?.toLowerCase()
  const campaignTitle = ifo.name
  const minLpForAchievement = publicIfoData.thresholdPoints
    ? formatBigNumber(publicIfoData.thresholdPoints, 3)
    : FIXED_MIN_DOLLAR_FOR_ACHIEVEMENT.div(publicIfoData.currencyPriceInUSD).toNumber().toFixed(3)

  return (
    <Container>
      <AchievementFlex isFinished={publicIfoData.status === 'finished'} alignItems="center" flexGrow={1}>
        <Image src={`/images/tokens/${ifo.token.address}.svg`} width={56} height={56} mr="8px" />
        <Flex flexDirection="column">
          <Text color="secondary" fontSize="12px">
            {`${t('Achievement')}:`}
          </Text>
          <Flex>
            <Text bold mr="8px">
              {t('IFO Shopper: %title%', { title: campaignTitle })}
            </Text>
          </Flex>
          {publicIfoData.currencyPriceInUSD.gt(0) ? (
            <Text color="textSubtle" fontSize="12px">
              {t('Commit ~%amount% %symbol% in total to earn!', {
                amount: minLpForAchievement,
                symbol: ifo.currency === tokens.cake ? 'CANARY' : 'LP',
              })}
            </Text>
          ) : (
            <Skeleton minHeight={18} width={80} />
          )}
        </Flex>
      </AchievementFlex>
      <Flex alignItems="flex-end" flexDirection="column">
        <StyledLinkExternal href={ifo.articleUrl} mb={[null, null, null, '8px']} textAlign="right">
          {t('Learn more about %title%', { title: campaignTitle })}
        </StyledLinkExternal>
        <StyledLinkExternal href={getBscScanLink(ifo.address, 'address')}>{t('View IFO Contract')}</StyledLinkExternal>
      </Flex>
    </Container>
  )
}

export default Achievement
