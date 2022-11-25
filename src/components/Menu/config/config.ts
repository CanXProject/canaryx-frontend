import { MenuItemsType } from 'canaryx-uikit'
import { ContextApi } from 'contexts/Localization/types'
// import { nftsBaseUrl } from 'views/Nft/market/constants'

export type ConfigMenuItemsType = MenuItemsType & { hideSubNav?: boolean }

const config: (t: ContextApi['t']) => ConfigMenuItemsType[] = (t) => [
  {
    label: t('Trade'),
    href: '/limitorders',
    icon: '/images1/icons/icon-trade.svg',
    activeIcon: '/images1/icons/icon-trade-active.svg',
    showItemsOnMobile: false,
    items: [],
  },
  {
    label: t('Swap'),
    href: '/swap',
    icon: '/images1/icons/icon-swap.svg',
    activeIcon: '/images1/icons/icon-swap-active.svg',
    items: [
      {
        label: t('Swap'),
        href: '/swap',
      },
      {
        label: t('Liquidity'),
        href: '/liquidity',
      },
    ],
  },
  {
    label: t('Earn'),
    href: '/farms',
    icon: '/images1/icons/icon-earn.svg',
    activeIcon: '/images1/icons/icon-earn-active.svg',
    items: [
      {
        label: t('Farms'),
        href: '/farms',
      },
      {
        label: t('Pools'),
        href: '/pools',
      },
    ],
  },
  {
    label: t('IFO'),
    href: '/ifo',
    icon: '/images1/icons/icon-ifo.svg',
    activeIcon: '/images1/icons/icon-ifo-active.svg',
    showItemsOnMobile: false,
    items: [],
  },
  {
    label: t('Create Token'),
    href: '/tokengen',
    icon: '/images1/icons/icon-create.svg',
    activeIcon: '/images1/icons/icon-create-active.svg',
    showItemsOnMobile: false,
    items: [],
  },
]

export default config
