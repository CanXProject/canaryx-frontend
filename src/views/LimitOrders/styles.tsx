import { Box, Flex, Button } from 'canaryx-uikit'
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

export const TicketContainer = styled.div`
  display: flex;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  // padding-right: 10px;
`
export const PairPanel = styled.div`
  height: 61px;
  padding: 7px;
  width: 30%;
`
export const PairContainer = styled.div`
  background: #ffffff;
  border: 1px solid #d8dce1;
  border-radius: 2px;
  height: 100%;
  width: 100%;
  display: flex;
  padding: 0 20px;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
`
export const PricePanel = styled.div`
  height: 61px;
  padding: 7px;
  width: 70%;
  @media screen and (max-width: 1100px) {
    width: 100%;
  }
`
export const PriceContainer = styled.div`
  background: #ffffff;
  border: 1px solid #d8dce1;
  border-radius: 2px;
  height: 100%;
  width: 100%;
  display: flex;
  padding: 0 20px;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  justify-content: space-between;
`
export const RangeItem = styled.div<{ $labelPosition: number }>`
  display: flex;
  position: relative;
  justify-content: space-between;
  width: 400px;
  @media screen and (max-width: 1280px) {
    width: 250px;
  }
  @media screen and (max-width: 900px) {
    width: 200px;
  }
  & > .range-bar {
    position: absolute;
    width: 250px;
    bottom: 7px;
    left: 50%;
    transform: translate(-50%, 0);
    @media screen and (max-width: 1280px) {
      width: 120px;
    }
    @media screen and (max-width: 1100px) {
      display: none;
    }
  }
  & > .range-label {
    position: absolute;
    // ${({ $labelPosition }) => ($labelPosition ? 'padding: 0 120px' : 'padding: 0 40px')};
    left: ${({ $labelPosition }) => ($labelPosition ? `${$labelPosition}%` : '50%')};
    transform: translate(${({ $labelPosition }) => ($labelPosition ? `-${$labelPosition}%` : '-50%')}, 0);
    bottom: -4px;
    width: 35px;
    @media screen and (max-width: 1280px) {
      width: 12px;
      bottom: 4px;
    @media screen and (max-width: 900px) {
      display: none;
    }
  }
`

export const HighItem = styled.div`
  margin-right: 0px;
  text-align: center;
  & > .title {
    font-size: 12px;
    font-weight: 400;
    color: #8c8d91;
    line-height: 16px;
    align-items: center;
  }
  & > .value {
    font-size: 12px;
    font-weight: 600;
    color: #8c8d91;
    line-height: 24px;
  }
`

export const PriceItem = styled.div`
  margin-right: 32px;
  text-align: center;
  & > .title {
    font-size: 12px;
    font-weight: 400;
    color: #8c8d91;
    line-height: 16px;
    align-items: center;
  }
  & > .value {
    font-size: 16px;
    font-weight: 400;
    color: #8c8d91;
    line-height: 16px;
  }
`
export const ChartContainer = styled.div`
  width: 100%;
  height: 516px;
  // padding-right: 10px;
  display: flex;
`

export const WalletStatusContainer = styled.div`
  @media screen and (max-width: 900px) {
    display: none;
  }
`

export const ChartArea = styled.div`
  @media screen and (max-width: 1100px) {
    display: none;
  }
  height: 100%;
  width: 75%;
  padding: 7px;
`
export const TradeArea = styled.div`
  height: 100%;
  width: 25%;
  padding: 7px;
`
export const OrderBookArea = styled.div`
  @media screen and (max-width: 900px) {
    display: none;
  }
  border: 1px solid #d8dce1;
  border-radius: 2px;
  height: 100%;
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
`
export const OrderBookPart = styled.div`
  flex: 1;
  & > .header {
    height: 38px;
    background: #f5f5f5;
    border: 0px solid #d8dce1;
    border-radius: 0px;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    color: #92959a;
    padding: 0 24px;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
  }
  & > .trades-header {
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    line-height: 13px;
    display: flex;
    justify-content: space-between;
    padding: 7px 24px;
    white-space: nowrap;
    overflow: hidden;
  }
  & > .trades-value {
    background: #ffffff;
    height: 198px;
    /* padding: 0 24px; */
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    line-height: 13px;
    overflow-y: auto;
    & > .column {
      display: flex;
      width: 100%;
      justify-content: space-between;
      padding: 7px 24px;
      cursor: pointer;
      z-index: 2;
    }
  }
`
export const HistoryPanel = styled.div`
  width: 100%;
  height: 450px;
  // padding-right: 10px;
  display: flex;
  white-space: nowrap;
  overflow-y: hidden;
`
export const HistoryTab = styled.div`
  width: 100%;
  height: 48px;
  display: flex;
  & > div {
    flex: 1;
    background: #f5f5f5;
    border-left: 1px solid #ececec;
    border-right: 1px solid #ececec;
    border-top: 1px solid #ececec;
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
    color: #92959a;
  }
  & > .active {
    background: #ffffff;
  }
`
export const HistoryTable = styled.div`
  height: 100%;
 
  border-radius: 2px;
  & > table {
      width: 100%;
      background: #FFFFFF;
      height: 250px;
     

      & > thead > tr {
      height: 50px;
      display: flex;
      background: #FFFFFF;
      border-bottom: 1px solid #ececec;
      border-left: 1px solid #ececec;
      border-right: 1px solid #ececec;
      justify-content: space-around;
      align-items: center;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      text-transform: uppercase;
      color: #969696;
      overflow: hidden;
      overflow-y: scroll;
        
    }
    & > tbody {
      background: #FFFFFF;
      height: 220px;
      border-left: 1px solid #ececec;
      border-right: 1px solid #ececec;
      border-bottom: 1px solid #ececec;
     & > tr {
        width: 100%;
        background: #FFFFFF;
        padding: 7px 0;
        display: flex;
        justify-content: space-around;
        align-items: left;
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        white-space: nowrap;
        
        color: #969696;
        height: 20px;
        font-weight: 400;
        line-height: 13px;
        overflow-y: scroll;
      }
    }
`
export const TradeBook = styled.div`
  flex: 1;
  & > .header {
    height: 48px;
    background: #f5f5f5;
    border: 0px solid #d8dce1;
    border-radius: 0px;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    color: #92959a;
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
  @media screen and (max-width: 1100px) {
  width: 100%;
  padding-right: 0px;
  }
  padding-right: 10px;
  & > .walletBtn {
    @media screen and (max-width: 900px) {
    display: none;
    }
    height: 61px;
    padding: 7px;
    & > button {
      width: 100%;
      height: 100%;
      background: linear-gradient(270deg, #1880DF 0%, #0088CC 100%);
      border-radius: 3px;
      border: 0px
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

export const StyledButton = styled(Button)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px solid #d8dce1;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  letter-spacing: 0.48px;
  color: #92959a;
  cursor: pointer;

  ${({ $isActive }) => $isActive} {
    background: #ffffff;
    border: none;
  }
`



export const SellOrBuyStyledButton = styled(StyledButton)`
  flex: 1;
  display: flex;
  background: #f5f5f5;

  align-items: center;
  justify-content: center;
  border: 1px solid #d8dce1;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  letter-spacing: 0.48px;
  color: #92959a;
  cursor: pointer;

  ${({ $isActive }) => $isActive} {
    background: ${props=>props.bgColor?props.bgColor:"#d8dce1"};
    border: none;
    color:white;
  }
`
export const OrderTypeContainer = styled(Flex)`
  // flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #d8dce1;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  letter-spacing: 0.48px;
  color: #92959a;
  cursor: pointer;
  height: 35px;
`

export const OrderTypeButton = styled(Button)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  letter-spacing: 0.48px;
  color: #92959a;
  cursor: pointer;
  padding: 0 12px;
  height: 100%;

  ${({ $isActive }) => $isActive} {
    background: ${props=>props.activeColor?props.activeColor:"#f5f5f5"};
    border: 1px solid #d8dce1;
    color:white;
  }
`

export const ActionTab = styled.div`
  height: 31px;
  display: flex;
`
export const ActionContent = styled.div`
  height: 100%;
  width: 100%;
  border: 1px solid #d8dce1;
  border-radius: 2px;
  background: #ffffff;
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
    width: 12px;
    cursor: pointer;
  }
`
export const MarketButton = styled(Button)`
  width: 66px;
  height: 20px;
  background-color: #eaeaea;
  border: 1px solid #d8dce1;
  border-radius: 2px;
  color: #a6a6a6;
  opacity: unset;
  box-shadow: unset;
`
export const PriceInput = styled.input`
  width: 100%;
  border: 1px solid #d8dce1;
  border-radius: 2px;
  height: 38px;
  margin-top: 12px;
  padding: 0 12px;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 12px;
  letter-spacing: 0.36px;
  justify-content: right;
`
export const CustomOrderButton = styled(Button)`
  height: 38px;
  background: ${props=>props.bgColor?props.bgColor:"#f5f5f5"};
  border: 0px solid #b0b0b0;
  color: ${props=>props.textColor?props.textColor:"#92959a"};

  backdrop-filter: blur(4px);
  border-radius: 2px;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.48px;
  box-shadow: unset;
  text-transform: uppercase;
`

export const ChartPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;

  @media screen and (max-width: 1100px) {
    width: 100%;
  }

  ${ChartContainer} {
    @media screen and (max-width: 1100px) {
      display: none;
    }
  }

  ${HistoryPanel} {
    @media screen and (max-width: 1100px) {
      display: none;
    }
  }
`

export const LimitContainer = styled.div`
  display: flex;
  @media screen and (max-width: 1100px) {
    flex-direction: column;
  }
  width: 100%;
`
