import { ethers } from 'ethers'

// export const sPairapiLink = 'https://tradingview.canaryx.finance/chart'
export const sPairapiLink = 'https://canaryx-dex-chart.herokuapp.com/chart'
// export const sPairapiLink = "http://127.0.0.1:5010/chart"
export const sOrderapiLink = 'https://sgborder.herokuapp.com/order'
// export const sOrderapiLink = "http://127.0.0.1:5011/order"
export const sTradeapiLink = 'https://sgbtrade1.herokuapp.com/trade'

export const nTradeapiLink = 'https://sgbchart.herokuapp.com/trade'
// export const sTradeapiLink = "http://127.0.0.1:5012/trade"  https://tradingview.canaryx.finance/trade

export function toEth(amount: any) {
  return ethers.utils.formatEther(String(amount))
}

export function toWei(amount: any) {
  return ethers.utils.parseEther(String(amount))
}
