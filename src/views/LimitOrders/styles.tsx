import { Box, Flex, Button } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const StyledSwapContainer = styled(Flex)<{ $isChartExpanded: boolean }>`
  flex-shrink: 0;
  height: fit-content;
  padding: 0 24px;

  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 0 40px;
  }

  ${({ theme }) => theme.mediaQueries.xxl} {
    ${({ $isChartExpanded }) => ($isChartExpanded ? 'padding: 0 120px' : 'padding: 0 40px')};
  }
`
export const StyledInputCurrencyWrapper = styled(Box)`
  width: 328px;
  ${({ theme }) => theme.mediaQueries.md} {
    width: 550px;
  }
`
// custom styles
export const LimitContainer = styled.div`
  display: flex;
  width: 100%;
`
export const ChartPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 94%;
`
export const TicketContainer = styled.div`
  display: flex;
  width: 100%;
  // padding-right: 10px;
`
export const PairPanel = styled.div`
  height: 61px;
  padding: 7px;
  width: 30%;
`
export const PairContainer = styled.div`
  background: #FFFFFF;
  border: 1px solid #D8DCE1;
  border-radius: 2px;
  height: 100%;
  width: 100%;
  display: flex;
  padding: 0 20px;
  align-items: center;
`
export const PricePanel = styled.div`
  height: 61px;
  padding: 7px;
  width: 70%;
`
export const PriceContainer = styled.div`
  background: #FFFFFF;
  border: 1px solid #D8DCE1;
  border-radius: 2px;
  height: 100%;
  width: 100%;
  display: flex;
  padding: 0 20px;
  align-items: center;
  justify-content: space-between;
`
export const PriceItem = styled.div`
  margin-right: 32px;
  & > .title {
    font-size: 12px;
    font-weight: 400;
    color: #8C8D91;
    line-height: 16px;
  }
  & > .value {
    font-size: 16px;
    font-weight: 600;
    color: #8C8D91;
    line-height: 24px;
  }
`
export const ChartContainer = styled.div`
  width: 100%;
  height: 516px;
  // padding-right: 10px;
  display: flex;
`
export const ChartArea = styled.div`
  height: 100%;
  width: 95%;
  padding: 7px;
`
export const TradeArea = styled.div`
  height: 100%;
  width: 20.3%;
  padding: 7px;
`
export const OrderBookArea = styled.div`
  border: 1px solid #D8DCE1;
  border-radius: 2px;
  height: 100%;
  display: flex;
  flex-direction: column;
`
export const OrderBookPart = styled.div`
  flex: 1;
  & > .header {
    height:38px;
    background: #F5F5F5;
    border: 1px solid #D8DCE1;
    border-radius: 2px;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    color: #92959A;
    padding: 0 24px;
    display: flex;
    align-items: center;
  }
  & > .trades-header {
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    line-height: 13px;
    display: flex;
    justify-content: space-between;
    padding: 7px 24px;
  }
  & > .trades-value {
    background: #ffffff;
    height: 205px;
    padding: 0 24px;
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    line-height: 13px;
    overflow-y: auto;
    & > .column {
      display: flex;
      justify-content: space-between;
      padding: 7px 0;
    }
  }
`
export const HistoryPanel = styled.div`
  width: 100%;
  height: 320px;
  // padding-right: 10px;
  display: flex;
`
export const HistoryTab = styled.div`
  width: 100%;
  height: 48px;
  display: flex;
  & > div {
    flex: 1;
    background: #F5F5F5;
    border: 1px solid #D8DCE1;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    letter-spacing: 0.48px;
    color: #92959A;
  }
  & > .active {
    background: #FFFFFF;
  }
`
export const HistoryTable = styled.div`
  height: 100%;
  padding-top: 7px;
  border-radius: 2px;
  & > table {
      width: 100%;
      & > thead > tr {
      height: 31px;
      display: flex;
      background: #F5F5F5;
      border: 1px solid #D8DCE1;
      justify-content: space-around;
      align-items: center;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      text-transform: uppercase;
      color: #969696;
    }
    & > tbody {
      background: #FFFFFF;
      height: 220px;
      border: 1px solid #D8DCE1;
      overflow-y: auto;
      & > tr {
        width: 100%;
        padding: 7px 0;
        display: flex;
        justify-content: space-around;
        align-items: center;
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
        text-transform: uppercase;
        color: #969696;
      }
    }
`
export const TradeBook = styled.div`
  flex: 1;
  & > .header {
    height:48px;
    background: #F5F5F5;
    border: 1px solid #D8DCE1;
    border-radius: 2px;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    color: #92959A;
    padding: 0 24px;
    display: flex;
    align-items: center;
  }
  & > .trades-header {
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    line-height: 13px;
    display: flex;
    justify-content: space-between;
    padding: 7px 24px;
  }
  & > .trades-value {
    background: #ffffff;
    height: 228px;
    padding: 0 24px;
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    line-height: 13px;
    overflow-y: auto;
    & > .column {
      display: flex;
      justify-content: space-between;
      padding: 7px 0;
    }
  }
`

export const ActionPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 20%;
  padding-right: 10px;
  & > .walletBtn {
    height: 61px;
    padding: 7px;
    & > button {
      width: 100%;
      height: 100%;
      background: linear-gradient(270deg, #1880DF 0%, #0088CC 100%);
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
    }
  }
`
export const ActionArea = styled.div`
  flex: 1;
  width: 100%;
  padding: 7px;
`
export const ActionTab = styled.div`
  height: 31px;
  display: flex;
  & > div {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F5F5F5;
    border: 1px solid #D8DCE1;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    letter-spacing: 0.48px;
    color: #92959A;
    cursor: pointer;
  }
  & > .active {
    background: #FFFFFF;
    border: none;
  }
`
export const ActionContent = styled.div`
  height: 100%;
  width: 100%;
  border: 1px solid #D8DCE1;
  border-radius: 2px;
  background: #FFFFFF;
`
export const ActionPart = styled.div`
  padding: 12px;
  padding-top: 24px;
`
export const PriceDiv = styled.div`
  display: flex;
  & > div {
    font-weight: bold;
    padding-right: 12px;
  }
  & > img {
    width: 20px;
    cursor: pointer;
  }
`
export const MarketButton = styled(Button)`
  width: 66px;
  height: 20px;
  background-color: #EAEAEA;
  border: 1px solid #D8DCE1;
  border-radius: 2px;
  color: #A6A6A6;
  opacity: unset;
  box-shadow: unset;
`
export const PriceInput = styled.input`
  width: 100%;
  border: 1px solid #D8DCE1;
  border-radius: 2px;
  height: 38px;
  margin-top: 12px;
  padding: 0 12px;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 12px;
  letter-spacing: 0.36px;
`
export const CustomOrderButton = styled(Button)`
  height: 38px;
  background: #F5F5F5;
  border: 1px solid #B0B0B0;
  backdrop-filter: blur(4px);
  border-radius: 2px;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.48px;
  color: #92959A;
  box-shadow: unset;
  text-transform: uppercase;
`