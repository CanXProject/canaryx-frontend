import { ethers } from "ethers";

export const sPairapiLink = "https://tradingview.canaryx.finance/chart"
// export const sPairapiLink = "http://127.0.0.1:5010/chart"
export const sOrderapiLink = "https://tradingview.canaryx.finance/order"
// export const sOrderapiLink = "http://127.0.0.1:5011/order"
export const sTradeapiLink = "https://tradingview.canaryx.finance/trade"
// export const sTradeapiLink = "http://127.0.0.1:5012/trade"  https://tradingview.canaryx.finance/trade

export function toEth(amount: any) {
    return ethers.utils.formatEther(String(amount));
}

export function toWei(amount: any) {
    return ethers.utils.parseEther(String(amount));
}