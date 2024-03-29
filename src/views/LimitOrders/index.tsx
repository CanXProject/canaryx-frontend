/* eslint-disable no-continue */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import {Currency, CurrencyAmount, ETHER, JSBI, Token, Trade } from 'canaryx-sdk'
import {
  Button,
  Text,
  Box,
  ArrowDownIcon,
  useModal,
  Flex,
  Card,
  Th,
  useMatchBreakpoints,
  Td,
  ButtonMenu,
  ButtonMenuItem,
  useTooltip,
} from 'canaryx-uikit'
import moment from "moment"
import { useIsTransactionUnsupported } from 'hooks/Trades'
import UnsupportedCurrencyFooter from 'components/UnsupportedCurrencyFooter'
import { RouteComponentProps } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import SwapWarningTokens from 'config/constants/swapWarningTokens'
import axios from 'axios'
import { BIG_TEN } from 'utils/bigNumber'
import { useOrderbookContract } from 'hooks/useContract'
import { getBep20Contract } from 'utils/contractHelpers'
import { getOrderBookAddress } from 'utils/addressHelpers'
import { space } from 'styled-system'
import BigNumber from 'bignumber.js'
import { CurrencyLogo } from 'components/Logo'
import { CurrencyInputPanelCustom, TextCustom } from 'components/CurrencyInputPanel/CurrencyInputPanelCustom'
import { CurrencyInputPanelCustom2 } from 'components/CurrencyInputPanel2/CurrencyInputPanelCustom2'
import useTheme from 'hooks/useTheme'
import AddressInputPanel from './components/AddressInputPanel'
import { ArrowWrapper, SwapCallbackError } from './components/styleds'
import { GreyCard } from '../../components/Card'
import { AutoColumn } from '../../components/Layout/Column'
import TradePrice from './components/TradePrice'
import ImportTokenWarningModal from './components/ImportTokenWarningModal'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { Field } from '../../state/limitorders/actions'
import { AutoRow, RowBetween } from '../../components/Layout/Row'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { INITIAL_ALLOWED_SLIPPAGE } from '../../config/constants'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/limitorders/hooks'
import {
  useExpertModeManager,
  useUserSlippageTolerance,
  useUserSingleHopOnly,
  useExchangeChartManager,
} from '../../state/user/hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import Page from '../Page'
import SwapWarningModal from './components/SwapWarningModal'
import {
  LimitContainer,
  ChartPanel,
  TicketContainer,
  ActionPanel,
  PairPanel,
  PairContainer,
  PricePanel,
  PriceContainer,
  PriceItem,
  RangeItem,
  HighItem,
  ChartContainer,
  ChartArea,
  TradeArea,
  OrderBookArea,
  OrderBookPart,
  HistoryPanel,
  TradeBook,
  ActionArea,
  ActionTab,
  ActionContent,
  ActionPart,
  PriceDiv,
  PriceInput,
  CustomOrderButton,
  StyledButton,
  OrderTypeContainer,
  OrderTypeButton,
  SellOrBuyStyledButton,
} from './styles'
import { TVChartContainer } from './TradingView/TVChartContainer'
import { CustomWalletConnectButton, CustomWalletConnectedButton } from './TradingView/CustomWalletConnectButton'
import AdvancedSwapDetailsDropdown from './components/AdvancedSwapDetailsDropdown'
import { sOrderapiLink, sTradeapiLink, nTradeapiLink } from './TradingView/Constants'
import { OrderStatus } from './constants'
import { OrderHistory } from './types'

// import LimitOrderTable from './components/LimitOrderTable'
// import PriceChartContainer from './components/Chart/PriceChartContainer'
import ConfirmSwapModal from './components/ConfirmSwapModal'
// import confirmPriceImpactWithoutFee from './components/confirmPriceImpactWithoutFee'
// import { useSwapCallback } from '../../hooks/useSwapCallback'
// import { computeTradePriceBreakdown } from '../../utils/prices'

interface CurrencyBalanceProps {
 
  currency?: Currency | null
 
}


const renderTotalMarketPrice = (price, showInverted) => {
  const formattedPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6)

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const label = showInverted
    ? `${price?.quoteCurrency?.symbol}`
    : `${price?.quoteCurrency?.symbol}`

  if (show) {
    return `${formattedPrice} ${label}`

  }
  return "0"
}
const CurrencyBalance = ({ currency }: CurrencyBalanceProps) => {
  const { account, library } = useActiveWeb3React()

    const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  if (!currency) {
    return <></>
  }
  const renderText = () => {
    if (selectedCurrencyBalance?.toSignificant(6)) {
      return     `${currency.name} : ${selectedCurrencyBalance?.toSignificant(6)}`

    }
    return ""
  }
  return <TextCustom>
    {renderText()}
  </TextCustom>
}
const TableWrapper = styled.div`
  & > div {
    width: 100%;
    background-color: ${({ theme }) => theme.colors.input};
    border: 0;
  }
  & button {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }
`

const Label = styled(Text)`
  font-size: 12px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`
const Table = styled.table`
  max-width: 100%;
  width: 100%;

  tbody tr:last-child {
    ${Td} {
      border-bottom: 0;
    }
  }

  ${space}
`

export default function LimitOrders({ history }: RouteComponentProps) {
  const loadedUrlParams = useDefaultsFromURLSearch()
  const { t } = useTranslation()
  const selectedPrice = useRef<HTMLInputElement>(null)
  const orderbookcontract = useOrderbookContract()
  const { isMobile } = useMatchBreakpoints()
  const [isChartExpanded] = useState(false)
  const [, setUserChartPreference] = useExchangeChartManager(isMobile)
  const [isChartDisplayed] = useState(true)
  const [, setIsValidLimitPrice] = useState(false)
  const [isapproved, setIsapproved] = useState(true)
  const [isMarketOrder, setIsMarketOrder] = useState(true)
  const [orderPrice, setOrderPrice] = useState('0')
  const [sellTickerHightlighted, setSellTickerHightlighted] = useState([])
  const [buyTickerHightlighted, setBuyTickerHightlighted] = useState([])
  const [tooltipComponent, setTooltipComponent] = useState(null)

  const {
    targetRef: sellTickerRef,
    tooltip: sellTooltip,
    tooltipVisible: sellTooltipVisible,
  } = useTooltip(tooltipComponent, { placement: 'left', trigger: 'hover' })
  const {
    targetRef: buyTickerRef,
    tooltip: buyTooltip,
    tooltipVisible: buyTooltipVisible,
  } = useTooltip(tooltipComponent, { placement: 'left', trigger: 'hover' })

  useEffect(() => {
    setUserChartPreference(false)
  }, [isChartDisplayed, setUserChartPreference])

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  )
  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()

  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !(token.address in defaultTokens)
    })

  const { account, library } = useActiveWeb3React()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()

  const inputCurrencyBalance = useCurrencyBalance(account ?? undefined, currencies[Field.INPUT] ?? undefined)

  // Price data
  // const {
  //   [Field.INPUT]: { currencyId: inputCurrencyId },
  //   [Field.OUTPUT]: { currencyId: outputCurrencyId },
  // } = useSwapState()

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const trade = showWrap ? undefined : v2Trade

  // const singleTokenPrice = useSingleTokenSwapInfo()

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput],
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput],
  )

  // modal and loading
  const [{ swapErrorMessage }] = useState<{
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  // const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  // const { callback: swapCallback } = useSwapCallback(trade, allowedSlippage, recipient)

  // const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const [singleHopOnly] = useUserSingleHopOnly()

  // const handleSwap = useCallback(() => {
  //   if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee, t)) {
  //     return
  //   }
  //   if (!swapCallback) {
  //     return
  //   }
  //   setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
  //   swapCallback()
  //     .then((hash) => {
  //       setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash })
  //     })
  //     .catch((error) => {
  //       setSwapState({
  //         attemptingTxn: false,
  //         tradeToConfirm,
  //         swapErrorMessage: error.message,
  //         txHash: undefined,
  //       })
  //     })
  // }, [priceImpactWithoutFee, swapCallback, tradeToConfirm, t])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(true)

  // warnings on slippage
  // const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  // const showApproveFlow =
  //   !swapInputError &&
  //   (approval === ApprovalState.NOT_APPROVED ||
  //     approval === ApprovalState.PENDING ||
  //     (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
  //   !(priceImpactSeverity > 3 && !isExpertMode)

  // const handleConfirmDismiss = useCallback(() => {
  //   setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
  //   // if there was a tx hash, we want to clear the input
  //   if (txHash) {
  //     onUserInput(Field.INPUT, '')
  //   }
  // }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  // const handleAcceptChanges = useCallback(() => {
  //   setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn })
  // }, [attemptingTxn, swapErrorMessage, trade, txHash])

  // swap warning state
  const [swapWarningCurrency, setSwapWarningCurrency] = useState(null)
  const [onPresentSwapWarningModal] = useModal(<SwapWarningModal swapCurrency={swapWarningCurrency} />)

  const shouldShowSwapWarning = (swapCurrency) => {
    const isWarningToken = Object.entries(SwapWarningTokens).find((warningTokenConfig) => {
      const warningTokenData = warningTokenConfig[1]
      return swapCurrency.address === warningTokenData.address
    })
    return Boolean(isWarningToken)
  }
  const [orderlist, setOrderlist] = useState([])
  const [corderlist, setCOrderlist] = useState([])

  const [index, setIndex] = useState(0)
  const handleClick = (newIndex) => setIndex(newIndex)
  const { theme } = useTheme()

  useEffect(() => {
    if (swapWarningCurrency) {
      onPresentSwapWarningModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapWarningCurrency])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
      const address0 = inputCurrency instanceof Token ? inputCurrency.address : inputCurrency === ETHER ? 'SGB' : ''
      if (address0 === 'SGB') setIsapproved(true)
      else setIsapproved(false)
      const showSwapWarning = shouldShowSwapWarning(inputCurrency)
      if (showSwapWarning) {
        setSwapWarningCurrency(inputCurrency)
      } else {
        setSwapWarningCurrency(null)
      }
    },
    [onCurrencySelection],
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact())
    }
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
      const showSwapWarning = shouldShowSwapWarning(outputCurrency)
      if (showSwapWarning) {
        setSwapWarningCurrency(outputCurrency)
      } else {
        setSwapWarningCurrency(null)
      }
    },

    [onCurrencySelection],
  )

  const handlePercentChange = (buttonValue: number) => {
    const value = new BigNumber(buttonValue)
    const percentageChangedValue = value.multipliedBy(inputCurrencyBalance.toSignificant(6))

    onUserInput(Field.INPUT, percentageChangedValue.toString())
  }

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const [onPresentImportTokenWarningModal] = useModal(
    <ImportTokenWarningModal tokens={importTokensNotInDefault} onCancel={() => history.push('/limitorders/')} />,
  )

  useEffect(() => {
    if (isMarketOrder) selectedPrice.current.value = formattedAmounts[Field.OUTPUT]
  }, [formattedAmounts])

  useEffect(() => {
    if (!isMarketOrder) selectedPrice.current.value = String(Number(formattedAmounts[Field.INPUT]) * Number(orderPrice))
  }, [orderPrice])

  useEffect(() => {
    if (importTokensNotInDefault.length > 0) {
      onPresentImportTokenWarningModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importTokensNotInDefault.length])

  // const [onPresentConfirmModal] = useModal(
  //   <ConfirmSwapModal
  //     trade={trade}
  //     originalTrade={tradeToConfirm}
  //     onAcceptChanges={handleAcceptChanges}
  //     attemptingTxn={attemptingTxn}
  //     txHash={txHash}
  //     recipient={recipient}
  //     allowedSlippage={allowedSlippage}
  //     onConfirm={handleSwap}
  //     swapErrorMessage={swapErrorMessage}
  //     customOnDismiss={handleConfirmDismiss}
  //   />,
  //   true,
  //   true,
  //   'confirmSwapModal',
  // )

  useEffect(() => {
    const currency0 = currencies[Field.INPUT]
    const address0 = currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : ''
    if (address0 === 'SGB') setIsapproved(true)
    else setIsapproved(false)
  }, [currencies[Field.INPUT]])

  const [corderid, setCorderid] = useState(-1)
  useEffect(() => {
    async function loadData() {
      const currency0 = currencies[Field.INPUT]
      const address0 = currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : ''
      const currency1 = currencies[Field.OUTPUT]
      const address1 = currency1 instanceof Token ? currency1.address : currency1 === ETHER ? 'SGB' : ''
      // let url = ''
      // if (address0 === 'SGB') {
      //   url = `${sOrderapiLink}/getorders?owner=`
      //     .concat('0x9411d474002ad455ae2bdd5ca9cf40686be8355f')
      //     .concat('&fromtoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED')
      //     .concat('&totoken=')
      //     .concat(address1)
      //   // url="https://sgborder.herokuapp.com/getorders?owner=".concat(account).concat('&fromtoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED').concat('&totoken=').concat(address1);
      // } else if (address0 === 'SGB') {
      //   url = `${sOrderapiLink}/getorders?owner=`
      //     .concat('0x9411d474002ad455ae2bdd5ca9cf40686be8355f')
      //     .concat('&fromtoken=')
      //     .concat(address0)
      //     .concat('&totoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED')
      //   // url="https://sgborder.herokuapp.com/getorders?owner=".concat(account).concat('&fromtoken=').concat(address0).concat('&totoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED');
      // } else {
      //   url = `${sOrderapiLink}/getorders?owner=`
      //     .concat('0x9411d474002ad455ae2bdd5ca9cf40686be8355f')
      //     .concat('&fromtoken=')
      //     .concat(address0)
      //     .concat('&totoken=')
      //     .concat(address1)
      //   // url="https://sgborder.herokuapp.com/getorders?owner=".concat(account).concat('&fromtoken=').concat(address0).concat('&totoken=').concat(address1);
      // }

      // const res = await axios.get(url)
      // const res2 = await axios.get(url.replace('getorders', 'getorders'))
      const arr = []
      const arr2 = []

      const { data } = await axios.get(`https://sgbchart.herokuapp.com/orders/getorders?owner=${account}`)

      if (data && data.length > 0 && defaultTokens) {
        const sortedData = data
          .filter((item: OrderHistory) => item.status !== OrderStatus.COMPLETED)
          .map((item) => ({
            ...item,
            fromtoken: item.fromtoken.toLowerCase(),
            owner: item.owner.toLowerCase(),
            totoken: item.totoken.toLowerCase(),
          }))

        for (let i = 0; i < sortedData.length; i++) {
          const { amount, fromtoken: fromToken, id, price, totoken: toToken } = sortedData[i]

          arr.push(
            <tr>
              <Td>{defaultTokens[fromToken]?.symbol}</Td>
              {/* <Td>{res.data[i].from_symbol}</Td> */}
              <Td>{defaultTokens[toToken].symbol}</Td>
              {/* <Td>{res.data[i].to_symbol}</Td> */}
              {/* <Td>{new BigNumber(res.data[i].amount).dividedBy(BIG_TEN.pow(18)).toString()}</Td> */}
              <Td>{new BigNumber(amount).dividedBy(BIG_TEN.pow(defaultTokens[fromToken]?.decimals)).toString()}</Td>
              {/* <Td>{new BigNumber(res.data[i].price).dividedBy(BIG_TEN.pow(18)).toString()}</Td> */}
              <Td>{new BigNumber(price).dividedBy(BIG_TEN.pow(defaultTokens[toToken].decimals)).toString()}</Td>
              <Td>
                <Button
                  onClick={async () => {
                    try {
                      if (fromToken === '0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED') {
                        const tx = await orderbookcontract.cancelETHorder(id)
                        await tx.wait()
                      } else {
                        const tx = await orderbookcontract.cancelTokenorder(id)
                        await tx.wait()
                      }
                      let url2 = ''
                      if (address0 === 'SGB') {
                        url2 = 'https://sgborder.herokuapp.com/cancelorder?owner='
                          .concat(account)
                          .concat('&id=')
                          .concat(id)
                          .concat('&fromtoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED')
                          .concat('&totoken=')
                          .concat(address1)
                      } else if (address0 === 'SGB') {
                        url2 = 'https://sgborder.herokuapp.com/cancelorder?owner='
                          .concat(account)
                          .concat('&id=')
                          .concat(id)
                          .concat('&fromtoken=')
                          .concat(address0)
                          .concat('&totoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED')
                      } else {
                        url2 = 'https://sgborder.herokuapp.com/cancelorder?owner='
                          .concat(account)
                          .concat('&id=')
                          .concat(id)
                          .concat('&fromtoken=')
                          .concat(address0)
                          .concat('&totoken=')
                          .concat(address1)
                      }
                      await axios.get(url2)
                      setCorderid(corderid - 1)
                    } catch (err) {
                      console.error(err)
                    }
                  }}
                  scale="xs"
                >
                  Cancel
                </Button>
              </Td>
            </tr>,
          )
        }
      }

      setOrderlist(arr)
      // for (let i = 0; i < res2.data.length; i++) {
      //   if (!defaultTokens[res2.data[i].fromtoken]) {
      //     continue
      //   }

      //   arr2.push(
      //     <tr>
      //       <Td>{defaultTokens[res2.data[i].fromtoken].symbol}</Td>
      //       <Td>{defaultTokens[res2.data[i].totoken].symbol}</Td>
      //       <Td>
      //         {new BigNumber(res2.data[i].amount)
      //           .dividedBy(BIG_TEN.pow(defaultTokens[res2.data[i].fromtoken].decimals))
      //           .toString()}
      //       </Td>
      //       <Td>
      //         {new BigNumber(res2.data[i].price)
      //           .dividedBy(BIG_TEN.pow(defaultTokens[res2.data[i].totoken].decimals))
      //           .toString()}
      //       </Td>
      //     </tr>,
      //   )
      // }
      setCOrderlist(arr2)
    }
    loadData()
  }, [account, corderid, currencies[Field.INPUT], currencies[Field.OUTPUT]])

  const [pairSymbol, setPairSymbol] = useState('WSGB/CANARY')
  const defaultTicker = {
    ticker: { price: '0', change: '0(0%)', volume: '0', low: '0', high: '0' },
    buy: [],
    sell: [],
    trades: [],
  }
  const [ticker, setTicker] = useState(defaultTicker)
  const [labelPosition, setLabelPosition] = useState(50)
  useEffect(() => {
    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) return
    const _symbol = `${currencies[Field.INPUT].symbol}/${currencies[Field.OUTPUT].symbol}`
    if (pairSymbol === _symbol) return
    const symbols = _symbol.split('/')
    if (symbols.indexOf('SGB') >= 0) {
      symbols[symbols.indexOf('SGB')] = 'WSGB'
    }
    const fixedSymbol = `${symbols[0]}/${symbols[1]}`

    setPairSymbol(fixedSymbol)
  }, [currencies[Field.INPUT], currencies[Field.OUTPUT]])

  useEffect(() => {
    axios
      .get(`${nTradeapiLink}/ticker?symbol=${pairSymbol}`)
      .then((res) => {
        setTicker(res.data)
        setPriceRangeLabelPosition(res.data)
      })
      .catch((err) => {
        console.error(err)
      })
    const interval = setInterval(() => {
      axios
        .get(`${nTradeapiLink}/ticker?symbol=${pairSymbol}`)
        .then((res) => {
          setTicker(res.data)
          setPriceRangeLabelPosition(res.data)
        })
        .catch((err) => {
          console.error(err)
        })
    }, 600000)
    return () => clearInterval(interval)
  }, [pairSymbol])

  const [, setOwnerOrders] = useState([])
  useEffect(() => {
    if (!account) return
    axios
      .get(`${sOrderapiLink}/getorders?owner=`.concat('0x9411d474002ad455ae2bdd5ca9cf40686be8355f'))
      .then((res) => {
        setOwnerOrders(res.data)
      })
      .catch((e) => {
        console.error(e)
      })
  }, [account, corderid])

  const orderEndRef = useRef(null)
  const scrollToBottom = () => {
    orderEndRef.current?.scroll(0, 10000)
  }
  // const [historyTabOpenOrder, setHistoryTabOpenOrder] = useState(true)

  const [actionTabBuy, setActionTabBuy] = useState(true)
  const switchTabBuy = (isBuy) => {
    if ((isBuy && !actionTabBuy) || (!isBuy && actionTabBuy)) {
      setApprovalSubmitted(false)
      onSwitchTokens()
    }
    if (isBuy) {
      setActionTabBuy(true)
    } else {
      setActionTabBuy(false)
    }
  }
  useEffect(() => {
    scrollToBottom()
  }, [])
  const setPriceRangeLabelPosition = (_ticker) => {
    if (!ticker) return
    let range = 0
    if (!_ticker.price && _ticker.high - _ticker.low > 0) {
      range = ((_ticker.price - _ticker.low) * 60) / (_ticker.high - _ticker.low)
      range += 20
      setLabelPosition(range)
    }
  }

  const handleMouseOnAveragePrice = (sellTickerIndex: number, side: string) => {
    const sideTickers = [...(side === 'sell' ? ticker.sell : ticker.buy)].map((item, tickerIndex) => {
      return { ...item, tickerIndex }
    })
    const sortedTickers = sideTickers.filter((_, tickerIndex) => {
      return side === 'sell' ? tickerIndex >= sellTickerIndex : tickerIndex <= sellTickerIndex
    })
    const sortedTickersIds = sortedTickers.map((item) => item.tickerIndex)
    const tooltipData = sortedTickers.reduce(({ price, amount, total }, curr) => {
      return {
        price: price + curr.price,
        amount: amount + curr.amount,
        total: total + curr.total,
      }
    })

    const tooltipTickersComponent = (
      <Flex flexDirection="column">
        <Text color="#92959a">Avg Price: {(tooltipData.price / sortedTickersIds.length).toFixed(2)}</Text>
        <Text color="#92959a">Amount: {tooltipData.amount.toFixed(2)}</Text>
        <Text color="#92959a">Total: {tooltipData.total.toFixed(2)}</Text>
      </Flex>
    )

    setTooltipComponent(tooltipTickersComponent)

    if (side === 'sell') {
      setSellTickerHightlighted(sortedTickersIds)
    } else {
      setBuyTickerHightlighted(sortedTickersIds)
    }
  }



 
 
  
  return (
    <Page removePadding={isChartExpanded} hideFooterOnDesktop={isChartExpanded} style={{ padding: 0 }}>
      <LimitContainer>
        <ChartPanel>
          <TicketContainer>
            <PairPanel>
              <PairContainer>
                <CurrencyLogo currency={currencies[Field.INPUT]} size="24px" style={{ marginRight: '8px' }} />
                <CurrencyLogo currency={currencies[Field.OUTPUT]} size="24px" style={{ marginRight: '8px' }} />
                <Text>{currencies[Field.INPUT]?.symbol}</Text>
                <Text>/</Text>
                <Text>{currencies[Field.OUTPUT]?.symbol}</Text>
              </PairContainer>
            </PairPanel>
            <PricePanel>
              <PriceContainer>
                <PriceItem>
                  <div className="title">PRICE</div>
                  <div className="value">{ticker?.ticker.price}</div>
                </PriceItem>
                <PriceItem>
                  <div className="title">24H CHANGES</div>
                  <div className="value">{ticker?.ticker.change}</div>
                </PriceItem>
                <PriceItem>
                  <div className="title">24H VOLUME</div>
                  <div className="value">{ticker?.ticker.volume}</div>
                </PriceItem>
                <RangeItem $labelPosition={labelPosition}>
                  <HighItem className="price-low">
                    <div className="title">24H LOW</div>
                    <div style={{ color: '#D9304E' }}>{ticker?.ticker.low}</div>
                  </HighItem>
                  <img className="range-bar" src="/images1/icons/@line.svg" alt="PriceBar" />
                  <img className="range-label" src="/images1/icons/@label.png" alt="PriceLabel" />

                  <HighItem className="price-high">
                    <div className="title">24H HIGH</div>
                    <div style={{ color: '#0088CC' }}>{ticker?.ticker.high}</div>
                  </HighItem>
                </RangeItem>
              </PriceContainer>
            </PricePanel>
          </TicketContainer>
          <ChartContainer>
            {/* TRADINGVIEW CHART */}

            <ChartArea>
              <TVChartContainer symbol={pairSymbol} />
            </ChartArea>

            {/* SIMPLE CHART */}

            {/* <ChartArea>
            <PriceChartContainer
             inputCurrencyId={inputCurrencyId}
             inputCurrency={currencies[Field.INPUT]}
             outputCurrencyId={outputCurrencyId}
             outputCurrency={currencies[Field.OUTPUT]}
             isChartExpanded={isChartExpanded}
             setIsChartExpanded={setIsChartExpanded}
             isChartDisplayed={isChartDisplayed}
             currentSwapPrice={singleTokenPrice}/>
            </ChartArea> */}

            {/* ORDERBOOK */}

            <TradeArea>
              <OrderBookArea>
                <OrderBookPart>
                  <div className="header">ORDER BOOK</div>
                  <div className="trades-header">
                    <div>Price</div>
                    <div>Volume</div>
                    <div>Total</div>
                  </div>
                  <div className="trades-value" ref={orderEndRef}>
                    {[...ticker?.sell].reverse().map((item, sellTickerIndex) => (
                      <>
                        {sellTooltipVisible && sellTooltip}
                        <div
                          className="column"
                          style={
                            sellTickerHightlighted.includes(sellTickerIndex)
                              ? { backgroundColor: '#7e7e7e4a' }
                              : { backgroundColor: 'transparent' }
                          }
                          onMouseEnter={() => handleMouseOnAveragePrice(sellTickerIndex, 'sell')}
                          onMouseLeave={() => setSellTickerHightlighted([])}
                          key={`column-${item.total}`}
                        >
                          <Flex
                            width="100%"
                            justifyContent="space-between"
                            ref={sellTickerHightlighted[0] === sellTickerIndex ? sellTickerRef : null}
                          >
                            <div style={{ color: '#D9304E' }}>{item.price}</div>
                            <div>{item.amount}</div>
                            <div>{item.total}</div>
                          </Flex>
                        </div>
                      </>
                    ))}
                  </div>
                </OrderBookPart>
                <OrderBookPart>
                  <div className="header">Spread: {ticker?.ticker.price}</div>
                  <div className="trades-value">
                    {[...ticker?.buy].reverse().map((item, buyTickerIndex) => (
                      <>
                        {buyTooltipVisible && buyTooltip}
                        <div
                          style={
                            buyTickerHightlighted.includes(buyTickerIndex)
                              ? { backgroundColor: '#7e7e7e4a' }
                              : { backgroundColor: 'transparent' }
                          }
                          onMouseEnter={() => handleMouseOnAveragePrice(buyTickerIndex, 'buy')}
                          onMouseLeave={() => setBuyTickerHightlighted([])}
                          className="column"
                          key={`column-${item.total}`}
                        >
                          <Flex
                            width="100%"
                            justifyContent="space-between"
                            ref={
                              buyTickerHightlighted[buyTickerHightlighted.length - 1] === buyTickerIndex
                                ? buyTickerRef
                                : null
                            }
                          >
                            <div style={{ color: '#0F8F62' }}>{item.price}</div>
                            <div>{item.amount}</div>
                            <div>{item.total}</div>
                          </Flex>
                        </div>
                      </>
                    ))}
                  </div>
                </OrderBookPart>
              </OrderBookArea>
            </TradeArea>
            {/* END OF ORDERBOOK */}
          </ChartContainer>

          {/* HISTORY */}
          <HistoryPanel>
            <ChartArea>
              <Flex flex="1" justifyContent="center" mb="24px">
                <Card style={{ width: '100%', height: 'max-content' }}>
                  <TableWrapper>
                    <ButtonMenu activeIndex={index} onItemClick={handleClick}>
                      <ButtonMenuItem
                        style={{
                          color: index === 0 ? theme.colors.text : theme.colors.textSubtle,
                          backgroundColor: index === 0 ? theme.card.background : theme.colors.input,
                        }}
                      >
                        Open Orders
                      </ButtonMenuItem>
                      <ButtonMenuItem
                        style={{
                          color: index === 1 ? theme.colors.text : theme.colors.textSubtle,
                          backgroundColor: index === 1 ? theme.card.background : theme.colors.input,
                        }}
                      >
                        Order History
                      </ButtonMenuItem>
                    </ButtonMenu>
                  </TableWrapper>
                  <Flex justifyContent="center">
                    <Box ml="auto" mr="auto" width="90%">
                      <Table>
                        <Table>
                          <tr>
                            <Th>
                              <Text fontSize="12px" bold textTransform="uppercase" color="textSubtle" textAlign="left">
                                FROM
                              </Text>
                            </Th>
                            <Th>
                              <Text fontSize="12px" bold textTransform="uppercase" color="textSubtle" textAlign="left">
                                TO
                              </Text>
                            </Th>
                            <Th>
                              <Text fontSize="12px" bold textTransform="uppercase" color="textSubtle" textAlign="left">
                                AMOUNT
                              </Text>
                            </Th>
                            <Th>
                              <Text fontSize="12px" bold textTransform="uppercase" color="textSubtle" textAlign="left">
                                LIMIT PRICE
                              </Text>
                            </Th>
                            <Th>{''.concat('')}</Th>
                          </tr>
                        </Table>
                        <div style={{ height: '343px', overflowY: 'auto' }}>
                          {/* <Table>{orderlist}</Table> */}
                          <Table>{index === 0 ? orderlist : corderlist}</Table>
                        </div>
                      </Table>

                      {/* END OF HISTORY */}
                    </Box>
                  </Flex>
                </Card>
              </Flex>
            </ChartArea>

            {/* COMPLETED TRADES */}
            <TradeArea>
              <OrderBookArea>
                <TradeBook>
                  <div className="header">TRADES</div>
                  <div className="trades-header">
                    <div>Price</div>
                    <div>Amount</div>
                    <div>Time</div>
                  </div>
                  <div className="trades-value" ref={orderEndRef}>
                    {ticker?.trades.map((item) => (
                      <div className="column" key={`column-${item.type}-${item.amount}-${item.time}`}>
                        <div style={{ color: item.type === 'sell' ? '#D9304E' : '#0F8F62' }}>{item.price}</div>
                        <div>{item.amount}</div>
                        <div>{moment(item.time).format("DD MMM hh:mm a")}</div>
                      </div>
                    ))}
                  </div>
                </TradeBook>
              </OrderBookArea>
            </TradeArea>
          </HistoryPanel>
        </ChartPanel>

        <ActionPanel>
          <div className="walletBtn">{account ? <CustomWalletConnectedButton /> : <CustomWalletConnectButton />}</div>

          <ActionArea>
            <ActionContent>
              <ActionTab>
                <SellOrBuyStyledButton
                  bgColor="#0088cc"
                  $isActive={!actionTabBuy}
                  className={actionTabBuy ? 'active' : ''}
                  onClick={() => switchTabBuy(true)}
                >
                  BUY
                </SellOrBuyStyledButton>
                <SellOrBuyStyledButton
                                    bgColor="#da2f4f"

                  $isActive={actionTabBuy}
                  className={actionTabBuy ? '' : 'active'}
                  onClick={() => switchTabBuy(false)}
                >
                  Sell
                </SellOrBuyStyledButton>
              </ActionTab>
              <ActionPart>
              <Flex>
                    <OrderTypeContainer>
                    <OrderTypeButton $isActive={isMarketOrder}
                      activeColor="linear-gradient(270deg, rgb(24, 128, 223) 0%, rgb(0, 136, 204)  100%)"
                      onClick={() => setIsMarketOrder(!isMarketOrder)}>
                        Market
                      </OrderTypeButton>
                    <OrderTypeButton
                      activeColor="linear-gradient(270deg, rgb(24, 128, 223) 0%, rgb(0, 136, 204)  100%)"
                      $isActive={!isMarketOrder} onClick={() => setIsMarketOrder(!isMarketOrder)}>
                        Limit
                      </OrderTypeButton>
                    </OrderTypeContainer>
                  </Flex>
                <AutoColumn gap="24px">
                  <CurrencyInputPanelCustom
                    isLimitOrder={isMarketOrder}
                    // label={independentField === Field.OUTPUT && !showWrap && trade ? t('From (estimated)') : t('From')}
                    // showMaxButton={!atMaxAmountInput}
                    value={formattedAmounts[Field.INPUT]}
                    currency={currencies[Field.INPUT]}
                    onUserInput={handleTypeInput}
                    onMax={handleMaxInput}
                    onCurrencySelect={handleInputSelect}
                    onPercentChange={handlePercentChange}
                    otherCurrency={currencies[Field.OUTPUT]}
                    id="swap-currency-input"
                  />

                 {isMarketOrder? <CurrencyInputPanelCustom2
                    value={formattedAmounts[Field.OUTPUT]}
                    onUserInput={handleTypeOutput}
                    label={independentField === Field.INPUT && !showWrap && trade ? t('To (estimated)') : t('To')}
                    showMaxButton={false}
                    currency={currencies[Field.OUTPUT]}
                    onCurrencySelect={handleOutputSelect}
                    otherCurrency={currencies[Field.INPUT]}
                    id="swap-currency-output"
                  />:null}

                  {isExpertMode && recipient !== null && !showWrap ? (
                    <>
                      <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                        <ArrowWrapper clickable={false}>
                          <ArrowDownIcon width="16px" />
                        </ArrowWrapper>
                        <Button variant="text" id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                          {t('- Remove send')}
                        </Button>
                      </AutoRow>
                      <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                    </>
                  ) : null}

                  {showWrap ? null : (
                    <AutoColumn gap="8px" style={{ padding: '0 16px' }}>
                      {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                        <RowBetween align="center">
                          <Label>{t('Slippage Tolerance')}</Label>
                          <Text bold color="primary">
                            {allowedSlippage / 100}%
                          </Text>
                        </RowBetween>
                      )}
                    </AutoColumn>
                  )}
                </AutoColumn>

             {/* {isMarketOrder?  <Box mt="1rem">
                  <Flex width="100%" justifyContent="space-between" position="relative" />
                  <TextCustom>Price:</TextCustom>
                  {!isMarketOrder ? (
                    <TradePrice
                      price={trade?.executionPrice}
                      setShowInverted={setShowInverted}
                      showInverted={showInverted}
                    />
                  ) : (
                    <PriceInput
                      placeholder="0"
                      disabled={!isMarketOrder}
                      onChange={(e) => {
                        setOrderPrice(e.target.value)
                      }}
                      value={orderPrice}
                    />
                  )}
                </Box>:null} */}

                <Box mt="1rem">
                  <Flex width="100%" justifyContent="space-between" position="relative">
                    <PriceDiv>
                      <TextCustom> Total Price:</TextCustom>
                      <TextCustom>
                        {renderTotalMarketPrice(trade?.executionPrice,showInverted)}
                      </TextCustom>

                    </PriceDiv>
                    
                  </Flex>
                  <PriceInput
                    placeholder="Set total price: 0"
                    ref={selectedPrice}
                    style={{display:"none"}}
                    disabled={isMarketOrder}
                    onChange={async (e) => {
                      if (e.target.value > formattedAmounts[Field.OUTPUT]) {
                        const currency0 = currencies[Field.INPUT]
                        const address0 =
                          currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : ''
                        if (address0 !== 'SGB') {
                          const con = getBep20Contract(address0, library.getSigner())

                          if (
                            (await con.allowance(account, getOrderBookAddress())) <
                            new BigNumber(formattedAmounts[Field.INPUT])
                              .times(BIG_TEN.pow(currencies[Field.INPUT].decimals))
                              .toString()
                          )
                            setIsapproved(false)
                          else setIsapproved(true)
                        }
                        setIsValidLimitPrice(true)
                      } else {
                        setIsValidLimitPrice(false)
                      }
                    }}
                  />
                </Box>

                <AutoColumn justify="space-between">
                  <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                    {recipient === null && !showWrap && isExpertMode ? (
                      <Button variant="text" id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                        {t('+ Add a send (optional)')}
                      </Button>
                    ) : null}
                  </AutoRow>
                </AutoColumn>

                <Box mt="1rem">
                  {swapIsUnsupported ? (
                    <CustomOrderButton width="100%" disabled mb="4px">
                      {t('Unsupported Asset')}
                    </CustomOrderButton>
                  ) : !account ? (
                    <CustomWalletConnectButton width="100%" />
                  ) : showWrap ? (
                    <CustomOrderButton width="100%" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                      {wrapInputError ??
                        (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                    </CustomOrderButton>
                  ) : noRoute && userHasSpecifiedInputOutput ? (
                    <GreyCard style={{ textAlign: 'center' }}>
                      <Text color="textSubtle" mb="4px">
                        {t('Insufficient liquidity for this trade.')}
                      </Text>
                      {singleHopOnly && (
                        <Text color="textSubtle" mb="4px">
                          {t('Try enabling multi-hop trades.')}
                        </Text>
                      )}
                    </GreyCard>
                  ) : isapproved ? (
                    <CustomOrderButton
                              variant="primary"
                              bgColor="#0088cc"
                              textColor="white"
                      onClick={async () => {
                        const currency0 = currencies[Field.INPUT]
                        const address0 =
                          currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : ''
                        const currency1 = currencies[Field.OUTPUT]
                        const address1 =
                          currency1 instanceof Token ? currency1.address : currency1 === ETHER ? 'SGB' : ''
                        let url = ''
                        let tx
                        const counter = await orderbookcontract.orderCounter()
                        const desiredPriceMinusFee = Number(selectedPrice.current.value) - Number(selectedPrice.current.value) * 0.0025

                        try {

                          if (address0 === 'SGB') {
                            url = 'https://sgborder.herokuapp.com/order/placeorder?id='
                              .concat(counter)
                              .concat('&owner=')
                              .concat(account)
                              .concat('&fromtoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED')
                              .concat('&totoken=')
                              .concat(address1)
                              .concat('&amount=')
                              .concat(
                                new BigNumber(formattedAmounts[Field.INPUT])
                                  .times(BIG_TEN.pow(currencies[Field.INPUT].decimals))
                                  .toString(),
                              )
                              .concat('&price=')
                              .concat(
                                new BigNumber(selectedPrice.current.value)
                                  .times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals))
                                  .toString(),
                              )

                            tx = await orderbookcontract.placeETHorder(
                              address1,
                              new BigNumber(desiredPriceMinusFee)
                                .times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals))
                                .toString(),
                              {
                                gasLimit: new BigNumber('190000').toString(),
                                value: new BigNumber(formattedAmounts[Field.INPUT])
                                  .times(BIG_TEN.pow(currencies[Field.INPUT].decimals))
                                  .toString(),
                              },
                            )
                          } else if (address1 === 'SGB') {
                            url = 'https://sgborder.herokuapp.com/order/placeorder?id='
                              .concat(counter)
                              .concat('&owner=')
                              .concat(account)
                              .concat('&fromtoken=')
                              .concat(address0)
                              .concat('&totoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED')
                              .concat('&amount=')
                              .concat(
                                new BigNumber(formattedAmounts[Field.INPUT])
                                  .times(BIG_TEN.pow(currencies[Field.INPUT].decimals))
                                  .toString(),
                              )
                              .concat('&price=')
                              .concat(
                                new BigNumber(selectedPrice.current.value)
                                  .times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals))
                                  .toString(),
                              )

                            tx = await orderbookcontract.placeTokenorder(
                              address0,
                              '0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED',
                              new BigNumber(formattedAmounts[Field.INPUT])
                                .times(BIG_TEN.pow(currencies[Field.INPUT].decimals))
                                .toString(),
                              new BigNumber(desiredPriceMinusFee)
                                .times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals))
                                .toString(),
                            )
                          } else {
                            url = 'https://sgborder.herokuapp.com/order/placeorder?id='
                              .concat(counter)
                              .concat('&owner=')
                              .concat(account)
                              .concat('&fromtoken=')
                              .concat(address0)
                              .concat('&totoken=')
                              .concat(address1)
                              .concat('&amount=')
                              .concat(
                                new BigNumber(formattedAmounts[Field.INPUT])
                                  .times(BIG_TEN.pow(currencies[Field.INPUT].decimals))
                                  .toString(),
                              )
                              .concat('&price=')
                              .concat(
                                new BigNumber(selectedPrice.current.value)
                                  .times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals))
                                  .toString(),
                              )

                            // const con = getBep20Contract(address0, library.getSigner())

                            tx = await orderbookcontract.placeTokenorder(
                              address0,
                              address1,
                              new BigNumber(formattedAmounts[Field.INPUT])
                                .times(BIG_TEN.pow(currencies[Field.INPUT].decimals))
                                .toString(),
                              new BigNumber(desiredPriceMinusFee)
                                .times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals))
                                .toString(),
                            )
                          }

                          await tx.wait().then(({ logs }) => {
                            const orderId = parseInt(logs[0].data, 16)

                            axios.get(`https://sgbchart.herokuapp.com/orders/placeorder?id=${orderId}`)
                          })

                          // axios.get(url, {})
                          // setCorderid(corderid + 1)
                        } catch (err) {
                          console.error(err)
                        }
                      }}
                      id="swap-button"
                      width="100%"
                      disabled={!isValid}
                    >
                      Place an Order
                    </CustomOrderButton>
                  ) : (
                    <CustomOrderButton
                                variant="primary"
                                bgColor="#0088cc"

                      onClick={async () => {
                        const currency0 = currencies[Field.INPUT]
                        const address0 =
                          currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : ''
                        // const currency1 = currencies[Field.OUTPUT]
                        // const address1 =
                        //   currency1 instanceof Token ? currency1.address : currency1 === ETHER ? 'SGB' : ''

                        await orderbookcontract.orderCounter()

                        try {
                          if (address0 !== 'SGB') {
                            const con = getBep20Contract(address0, library.getSigner())
                            const tx = await con.approve(
                              getOrderBookAddress(),
                              new BigNumber(formattedAmounts[Field.INPUT])
                                .times(BIG_TEN.pow(currencies[Field.INPUT].decimals))
                                .toString(),
                            )
                            await tx.wait()
                            setIsapproved(true)
                          }
                        } catch (err) {
                          console.error(err)
                        }
                      }}
                      id="swap-button"
                      width="100%"
                      disabled={!isValid}
                    >
                      Approve
                    </CustomOrderButton>
                  )}

                  {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                </Box>

                <Box mt="1rem">

                  
                    <CurrencyBalance currency={currencies[Field.INPUT]}/>
                    <CurrencyBalance currency={currencies[Field.OUTPUT]}/>

                  {/* <TextCustom>{getTokenBalance(currencies[Field.INPUT]) }</TextCustom>
                  <TextCustom>{getTokenBalance(currencies[Field.OUTPUT]) }</TextCustom> */}


                </Box>

                <div className="header">
                  {' '}
                  {!swapIsUnsupported ? (
                    trade && <AdvancedSwapDetailsDropdown trade={trade} />
                  ) : (
                    <UnsupportedCurrencyFooter currencies={[currencies.INPUT, currencies.OUTPUT]} />
                  )}
                </div>
              </ActionPart>
            </ActionContent>
          </ActionArea>
        </ActionPanel>
      </LimitContainer>
    </Page>
  )
}
