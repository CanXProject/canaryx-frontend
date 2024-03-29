import React from 'react'
import { Heading, Flex } from 'canaryx-uikit'
import { useTranslation } from 'contexts/Localization'
// import { useGetStats } from 'hooks/api'
// import { formatLocalisedCompactNumber } from 'utils/formatBalance'
// import  { IconCardData } from '../IconCard'

// import useTheme from 'hooks/useTheme'
// import StatCardContent from './StatCardContent'
// import GradientLogo from '../GradientLogoSvg'

// Values fetched from bitQuery effective 6/9/21
// const txCount = 30841921
// const addressCount = 2751624

const Stats = () => {
  const { t } = useTranslation()
  // const data = useGetStats()
  // const { theme } = useTheme()

  // const tvlString = data ? formatLocalisedCompactNumber(data.tvl) : '-'
  // const trades = formatLocalisedCompactNumber(txCount)
  // const users = formatLocalisedCompactNumber(addressCount)

  // const tvlText = t('And those users are now entrusting the platform with over $%tvl% in funds.', { tvl: tvlString })
  // const [entrusting, inFunds] = tvlText.split(tvlString)

  // const UsersCardData: IconCardData = {
  //   icon: <CommunityIcon color="secondary" width="36px" />,
  // }

  // const TradesCardData: IconCardData = {
  //   icon: <SwapIcon color="primary" width="36px" />,
  // }

  // const StakedCardData: IconCardData = {
  //   icon: <ChartIcon color="failure" width="36px" />,
  // }

  return (
    <Flex justifyContent="center" alignItems="center" flexDirection="column">
      <Heading textAlign="center" scale="xl">
        {t('CREATE. TRADE. EARN.')}
      </Heading>
    </Flex>
  )
}

export default Stats
