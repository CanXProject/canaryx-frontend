/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { CurrencyAmount, ETHER, JSBI, Token, Trade } from '@pancakeswap/sdk'
import AddressInputPanel from './components/AddressInputPanel'
import { ArrowWrapper, SwapCallbackError, Wrapper } from './components/styleds'
import {
  Button,
  Text,
  Box,
  ArrowDownIcon,
  IconButton,
  useModal,
  Flex,
  Card,
  Th,
  useMatchBreakpoints,
  Td,
} from '@pancakeswap/uikit'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import LimitOrderTable from './components/LimitOrderTable'
import UnsupportedCurrencyFooter from 'components/UnsupportedCurrencyFooter'
import { RouteComponentProps } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import SwapWarningTokens from 'config/constants/swapWarningTokens'
import axios from 'axios'
import { BIG_TEN } from 'utils/bigNumber'
import { useOrderbookContract } from 'hooks/useContract'
import { getBep20Contract } from 'utils/contractHelpers'
import { getOrderBookAddress } from 'utils/addressHelpers'
import { space } from "styled-system";
import BigNumber from 'bignumber.js'
import { CurrencyLogo } from 'components/Logo';
import { GreyCard } from '../../components/Card'
import { AutoColumn } from '../../components/Layout/Column'
import ConfirmSwapModal from './components/ConfirmSwapModal'
import { CurrencyInputPanelCustom, TextCustom } from 'components/CurrencyInputPanel/CurrencyInputPanelCustom'
import { CurrencyInputPanelCustom2 } from 'components/CurrencyInputPanel2/CurrencyInputPanelCustom2'
import TradePrice from './components/TradePrice'
import PriceChartContainer from './components/Chart/PriceChartContainer'  
import confirmPriceImpactWithoutFee from './components/confirmPriceImpactWithoutFee'
import ImportTokenWarningModal from './components/ImportTokenWarningModal'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { Field } from '../../state/limitorders/actions'
import { AutoRow, RowBetween } from '../../components/Layout/Row'
import { INITIAL_ALLOWED_SLIPPAGE } from '../../config/constants'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
  useSingleTokenSwapInfo,
} from '../../state/limitorders/hooks'
import {
  useExpertModeManager,
  useUserSlippageTolerance,
  useUserSingleHopOnly,
  useExchangeChartManager,
} from '../../state/user/hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import Page from '../Page'
import SwapWarningModal from './components/SwapWarningModal'
import {
  StyledInputCurrencyWrapper, StyledSwapContainer, LimitContainer, ChartPanel, TicketContainer, ActionPanel,
  PairPanel, PairContainer, PricePanel, PriceContainer, PriceItem, RangeItem, HighItem, ChartContainer, ChartArea, TradeArea,
  OrderBookArea, OrderBookPart, HistoryPanel, HistoryTab, TradeBook, HistoryTable, ActionArea, ActionTab, ActionContent,
  ActionPart, PriceDiv, MarketButton, PriceInput, CustomOrderButton
} from './styles';
import { TVChartContainer } from './TradingView/TVChartContainer'
import { CustomWalletConnectButton, CustomWalletConnectedButton } from './TradingView/CustomWalletConnectButton'
import AdvancedSwapDetailsDropdown from './components/AdvancedSwapDetailsDropdown'
import { sPairapiLink, sOrderapiLink, sTradeapiLink, toEth } from './TradingView/Constants';

const StyledInput = styled.input`
  color: ${({ theme }) => (theme.colors.text)};
  width: 100%;
  position: relative;
  font-weight: 500;
  outline: none;
  border: none;
  font-size: 16px;
  white-space: nowrap;
  padding: 20px;
  background:"#999999";
  text-align: right;

  ::placeholder {
    color: ${({ theme }) => theme.colors.textDisabled};
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
`;

export default function LimitOrders({ history }: RouteComponentProps) {
  const loadedUrlParams = useDefaultsFromURLSearch()
  const { t } = useTranslation()
  const selectedPrice = useRef<HTMLInputElement>(null);
  const orderbookcontract = useOrderbookContract();
  const { isMobile } = useMatchBreakpoints()
  const [isChartExpanded, setIsChartExpanded] = useState(false)
  const [userChartPreference, setUserChartPreference] = useExchangeChartManager(isMobile)
  const [isChartDisplayed, setIsChartDisplayed] = useState(true)
  const [isValidLimitPrice, setIsValidLimitPrice] = useState(false);
  const [isapproved, setIsapproved] = useState(true);
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

  // Price data
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const trade = showWrap ? undefined : v2Trade

  const singleTokenPrice = useSingleTokenSwapInfo()

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
  const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
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
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const [singleHopOnly] = useUserSingleHopOnly()

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee, t)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [priceImpactWithoutFee, swapCallback, tradeToConfirm, t])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(true)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn })
  }, [attemptingTxn, swapErrorMessage, trade, txHash])

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
      const address0 = (inputCurrency instanceof Token ? inputCurrency.address : inputCurrency === ETHER ? 'SGB' : '')
      if (address0 === "SGB")
        setIsapproved(true);
      else
        setIsapproved(false);
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

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const [onPresentImportTokenWarningModal] = useModal(
    <ImportTokenWarningModal tokens={importTokensNotInDefault} onCancel={() => history.push('/limitorders/')} />,
  )

  useEffect(() => {
    if (importTokensNotInDefault.length > 0) {
      onPresentImportTokenWarningModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importTokensNotInDefault.length])

  const [onPresentConfirmModal] = useModal(
    <ConfirmSwapModal
      trade={trade}
      originalTrade={tradeToConfirm}
      onAcceptChanges={handleAcceptChanges}
      attemptingTxn={attemptingTxn}
      txHash={txHash}
      recipient={recipient}
      allowedSlippage={allowedSlippage}
      onConfirm={handleSwap}
      swapErrorMessage={swapErrorMessage}
      customOnDismiss={handleConfirmDismiss}
    />,
    true,
    true,
    'confirmSwapModal',
  )

  useEffect(() => {
    const currency0 = currencies[Field.INPUT];
    const address0 = (currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : '')
    if (address0 === "SGB")
      setIsapproved(true)
    else
      setIsapproved(false);
  }, [currencies[Field.INPUT]])

  
  const [corderid, setCorderid] = useState(-1);
  useEffect(()=>{
    async function loadData()
    {
      const res=await axios.get("https://sgborder.herokuapp.com/getorders?owner=".concat(account))
      const arr=[];
      for(let i=0;i<res.data.length;i++)
      {
        
        arr.push( <tr>
          <Td>{defaultTokens[res.data[i].data.fromtoken].symbol}</Td>
          <Td>{defaultTokens[res.data[i].data.totoken].symbol}</Td>
          <Td>{new BigNumber(res.data[i].data.amount).dividedBy(BIG_TEN.pow(defaultTokens[res.data[i].data.fromtoken].decimals)).toString()}</Td>
          <Td>{new BigNumber(res.data[i].data.price).dividedBy(BIG_TEN.pow(defaultTokens[res.data[i].data.totoken].decimals)).toString()}</Td>
          <Td><Button onClick={async ()=>{
            try{
              if(res.data[i].data.fromtoken==="0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED")
              {
                const tx=await orderbookcontract.cancelETHorder(res.data[i].data.id);
                const receipt=await tx.wait();
              }
              else
              {
                const tx=await orderbookcontract.cancelTokenorder(res.data[i].data.id);
                const receipt=await tx.wait();
              }
            const resp=await axios.get("https://sgborder.herokuapp.com/cancelorder?owner=".concat(account).concat('&id=').concat(res.data[i].data.id))
            console.log(resp.data)
            
            }
            catch(err)
            {
              console.log(err)
            }
          }} scale="xs">Cancel</Button></Td>
        </tr>)
      }
      setOrderlist(arr)
    }
    loadData();
  },[account,corderid])


  

  const [pairSymbol, setPairSymbol] = useState("WSGB/CANARY");
  const default_ticker = { ticker: { price: '0', change: '0(0%)', volume: '0', low: '0', high: '0' }, buy: [], sell: [], trades: [] }
  const [ticker, setTicker] = useState(default_ticker);
  const [labelPosition, setLabelPosition] = useState(50);
  useEffect(() => {
    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) return;
    let _symbol = currencies[Field.INPUT].symbol + "/" + currencies[Field.OUTPUT].symbol;
    if (pairSymbol === _symbol) return;
    let symbols = _symbol.split('/');
    if (symbols.indexOf('SGB') >= 0) {
      symbols[symbols.indexOf('SGB')] = 'WSGB';
    }
    let fixed_symbol = symbols[0] + '/' + symbols[1];
    setPairSymbol(fixed_symbol);
  }, [currencies[Field.INPUT], currencies[Field.OUTPUT]]);

  useEffect(() => {
    axios.get(`https://sgbtrade.herokuapp.com/ticker?symbol=${pairSymbol}`)
      .then(res => {
        setTicker(res.data);
        setPriceRangeLabelPosition(res.data);
      })
      .catch(err => {
        console.log("ticker api error: ", err.message)
      })
    const interval = setInterval(() => {
      axios.get(`https://sgbtrade.herokuapp.com/ticker?symbol=${pairSymbol}`)
        .then(res => {
          setTicker(res.data);
          setPriceRangeLabelPosition(res.data);
        })
        .catch(err => {
          console.log("ticker api error: ", err.message)
        })
    }, 600000)
    return () => clearInterval(interval)
  }, [pairSymbol])

  const [ownerOrders, setOwnerOrders] = useState([]);
  useEffect(() => {
    if (!account) return;
    axios.get(`${sOrderapiLink}/getorders?owner=`.concat(account)).then(res => {
      console.log("get order: ", res.data);
      setOwnerOrders(res.data);
    }).catch(e => {
      console.log("get order error: ", e.message);
    })
  }, [account, corderid])

  const orderEndRef = useRef(null);
  const scrollToBottom = () => {
    orderEndRef.current?.scroll(0, 10000)
  }
  const [historyTabOpenOrder, setHistoryTabOpenOrder] = useState(true);
  const [actionTabBuy, setActionTabBuy] = useState(true);
  const switchTabBuy = (isBuy) => {
    if ((isBuy && !actionTabBuy) || (!isBuy && actionTabBuy)) {
      setApprovalSubmitted(false);
      onSwitchTokens();
    }
    if (isBuy) {
      setActionTabBuy(true);
    } else {
      setActionTabBuy(false);
    }
  }
  useEffect(() => {
    scrollToBottom()
  }, []);
  const setPriceRangeLabelPosition = (_ticker) => {
    if (!ticker) return;
    let range = 0;
    if (!_ticker.price && (_ticker.high - _ticker.low) > 0) {
      range = ((_ticker.price - _ticker.low) * 60 / (_ticker.high - _ticker.low));
      range = range + 20;
      setLabelPosition(range);
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
                  <div className='title'>PRICE</div>
                  <div className='value'>{ticker?.ticker.price}</div>
                </PriceItem>
                <PriceItem>
                  <div className='title'>24H CHANGES</div>
                  <div className='value'>{ticker?.ticker.change}</div>
                </PriceItem>
                <PriceItem>
                  <div className='title'>24H VOLUME</div>
                  <div className='value'>{ticker?.ticker.volume}</div>
                </PriceItem>
                <RangeItem $labelPosition={labelPosition}>
                  <HighItem className='price-low'>
                    <div className='title'>24H LOW</div>
                    <div style={{ color: '#D9304E' }}>{ticker?.ticker.low}</div>
                  </HighItem>
                  <img className='range-bar' src='/images1/icons/@line.svg' alt='PriceBar' />
                  <img className='range-label' src='/images1/icons/@label.png' alt="PriceLabel" />
                  
                  <HighItem className='price-high'>
                    <div className='title'>24H HIGH</div>
                    <div style={{ color: '#0088CC' }}>{ticker?.ticker.high}</div>
                  </HighItem>
                </RangeItem>


              </PriceContainer>
            </PricePanel>
          </TicketContainer>
          <ChartContainer>
            <ChartArea>
              <TVChartContainer symbol={pairSymbol} />
            </ChartArea>
            <TradeArea>
              <OrderBookArea>
                <OrderBookPart>
                  <div className='header'>ORDER BOOK</div>
                  <div className='trades-header'>
                    <div>Price</div>
                    <div>Volume</div>
                    <div>Total</div>
                  </div>
                  <div className='trades-value' ref={orderEndRef} >
                    {ticker?.sell.map((item, _index) => (
                      <div className='column' key={_index}>
                        <div style={{ color: '#D9304E' }}>{item.price}</div>
                        <div>{item.amount}</div>
                        <div>{item.total}</div>
                      </div>
                    ))}
                  </div>
                </OrderBookPart>
                <OrderBookPart>
                  <div className='header'></div>
                  <div className='trades-value'>
                    {ticker?.buy.map((item, _index) => (
                      <div className='column' key={_index}>
                        <div style={{ color: '#0F8F62' }}>{item.price}</div>
                        <div>{item.amount}</div>
                        <div>{item.total}</div>
                      </div>
                    ))}
                  </div>
                </OrderBookPart>
              </OrderBookArea>
            </TradeArea>
          </ChartContainer>
          <HistoryPanel>
            <ChartArea>
           
<HistoryTab>
                <div className={historyTabOpenOrder ? 'active' : ''} onClick={() => setHistoryTabOpenOrder(true)}>Open Orders</div>
                <div className={historyTabOpenOrder ? '' : 'active'} onClick={() => setHistoryTabOpenOrder(false)}>Order History</div>
              </HistoryTab>
              <HistoryTable>
                <table>
                  <thead>
                    <tr>
                      <th>FROM</th>
                      <th>TO</th>
                      <th>AMOUNT</th>
                      <th>LIMIT PRICE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                  
                    {historyTabOpenOrder && ownerOrders.map((orderItem, index) => (
                      !orderItem.cancelled && <tr key={index}>
                        <td>{orderItem.from_symbol}</td>
                        <td>{orderItem.to_symbol}</td>
                        <td>{toEth(orderItem.amount)}</td>
                        <td>{toEth(orderItem.price)}</td>
                        <td>...</td>
                      </tr>
                    ))}
                      {!historyTabOpenOrder && ownerOrders.map((orderItem, index) => (
                      orderItem.cancelled && <tr key={index}>
                        <td>{orderItem.from_symbol}</td>
                        <td>{orderItem.to_symbol}</td>
                        <td>{toEth(orderItem.amount)}</td>
                        <td>{toEth(orderItem.price)}</td>
                        <td>...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </HistoryTable>
            </ChartArea>
            <TradeArea>
              <OrderBookArea>
                <TradeBook>
                  <div className='header'>TRADES</div>
                  <div className='trades-header'>
                    <div>Price</div>
                    <div>Amount</div>
                    <div>Time</div>
                  </div>
                  <div className='trades-value' ref={orderEndRef} >
                    {ticker?.trades.map((item, _index) => (
                      <div className='column' key={_index}>
                        <div style={{ color: item.type === 'sell' ? '#D9304E' : '#0F8F62' }}>{item.price}</div>
                        <div>{item.amount}</div>
                        <div>{item.time}</div>
                      </div>
                    ))}
                  </div>
                </TradeBook>
              </OrderBookArea>
            </TradeArea>
          </HistoryPanel>
        </ChartPanel>

        <ActionPanel>
          <div className='walletBtn'>
            {account ? <CustomWalletConnectedButton /> : <CustomWalletConnectButton />}
          </div>

          <ActionArea>
            <ActionContent>
              <ActionTab>
                <div className={actionTabBuy ? 'active' : ''} onClick={() => switchTabBuy(true)}>BUY</div>
                <div className={actionTabBuy ? '' : 'active'} onClick={() => switchTabBuy(false)}>Sell</div>
              </ActionTab>
              <ActionPart>
                <AutoColumn gap="md">
                  <CurrencyInputPanelCustom
                    label={
                      independentField === Field.OUTPUT && !showWrap && trade ? t('From (estimated)') : t('From')
                    }
                    value={formattedAmounts[Field.INPUT]}
                    showMaxButton={!atMaxAmountInput}
                    currency={currencies[Field.INPUT]}
                    onUserInput={handleTypeInput}
                    onMax={handleMaxInput}
                    onCurrencySelect={handleInputSelect}
                    otherCurrency={currencies[Field.OUTPUT]}
                    id="swap-currency-input"
                  />

                   

                  <CurrencyInputPanelCustom2
                    value={formattedAmounts[Field.OUTPUT]}
                    onUserInput={handleTypeOutput}
                    label={independentField === Field.INPUT && !showWrap && trade ? t('To (estimated)') : t('To')}
                    showMaxButton={false}
                    currency={currencies[Field.OUTPUT]}
                    onCurrencySelect={handleOutputSelect}
                    otherCurrency={currencies[Field.INPUT]}
                    id="swap-currency-output"
                  />

                    

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

 <Box mt="1rem" style={{ paddingTop: 24 }}>
                  <Flex width="100%" justifyContent="space-between" position="relative">
                    
                  </Flex>
 <TextCustom>Price:</TextCustom>
                          < TradePrice
                            price={trade?.executionPrice}
                            setShowInverted={setShowInverted}
                            showInverted={showInverted}
                          />
                   </Box>
             


                <Box mt="1rem" style={{ paddingTop: 24 }}>
                  <Flex width="100%" justifyContent="space-between" position="relative">
                    <PriceDiv>
                      <TextCustom>Total Price:</TextCustom>
                       <img src='/images1/icons/icon-price.svg' alt='PriceIcon'
                            width="16px"
                            onClick={() => {
                              setApprovalSubmitted(false) // reset 2 step UI for approvals
                              onSwitchTokens()
                            }}
                            color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? 'primary' : 'text'}
                          />
                    
             
                    </PriceDiv>
                    <MarketButton onClick={() => {
                      selectedPrice.current.value = (formattedAmounts[Field.OUTPUT])
                    }} scale='xs'>MARKET</MarketButton>

                    
                  </Flex>
                  <PriceInput
                    
                    placeholder='Set total price: 0'
                    ref={selectedPrice}
                    onChange={async e => {
                      if (e.target.value > formattedAmounts[Field.OUTPUT]) {
                        const currency0 = currencies[Field.INPUT];
                        const address0 = (currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : '')
                        if (address0 !== "SGB") {
                          const con = getBep20Contract(address0, library.getSigner());

                          if ((await con.allowance(account, getOrderBookAddress())) < new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString())
                            setIsapproved(false);
                          else
                            setIsapproved(true)
                        }
                        setIsValidLimitPrice(true)
                      }
                      else {
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
                  ) :
                    (isapproved ?
                      <CustomOrderButton
                        variant='primary'
                        onClick={async () => {
                          const currency0 = currencies[Field.INPUT];
                          const address0 = (currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : '')
                          const currency1 = currencies[Field.OUTPUT];
                          const address1 = (currency1 instanceof Token ? currency1.address : currency1 === ETHER ? 'SGB' : '')
                          let url = ''
                          let tx;
                          const counter = await orderbookcontract.orderCounter()
                          console.log(counter)
                            try {
                              if (address0 === "SGB") {
                                url = 'https://sgborder.herokuapp.com/placeorder?id='.concat(counter).concat('&owner=').concat(account).concat('&fromtoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED').concat('&totoken=').concat(address1).concat('&amount=').concat(new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString()).concat('&price=').concat(new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString());
                                console.log(0, url)
                                tx = await orderbookcontract.placeETHorder(address1, new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString(), new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString(), { value: new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString() })
                              }
                              else if (address1 === "SGB") {

                                url = 'https://sgborder.herokuapp.com/placeorder?id='.concat(counter).concat('&owner=').concat(account).concat('&fromtoken=').concat(address0).concat('&totoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED').concat('&amount=').concat(new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString()).concat('&price=').concat(new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString());
                                console.log(1, url)

                                tx = await orderbookcontract.placeTokenorder(address0, "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED", new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString(), new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString())
                              }
                              else {
                                url = 'https://sgborder.herokuapp.com/placeorder?id='.concat(counter).concat('&owner=').concat(account).concat('&fromtoken=').concat(address0).concat('&totoken=').concat(address1).concat('&amount=').concat(new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString()).concat('&price=').concat(new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString());
                                console.log(2, url)
                                const con = getBep20Contract(address0, library.getSigner());


                                tx = await orderbookcontract.placeTokenorder(address0, address1, new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString(), new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString())
                              }
                            const receipt = await tx.wait()
                            console.log(receipt)
                            const res = await axios.get(url, {})
                            setCorderid(corderid + 1);
                            console.log(res)
                          }
                          catch (err) {
                            console.log(err)
                          }
                        }}
                        id="swap-button"
                        width="100%"
                        disabled={!isValid || !isValidLimitPrice}
                      >
                        Place an Order
                      </CustomOrderButton>
                      :
                      <CustomOrderButton
                        variant='primary'
                        onClick={async () => {
                          const currency0 = currencies[Field.INPUT];
                          const address0 = (currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : '')
                          const currency1 = currencies[Field.OUTPUT];
                          const address1 = (currency1 instanceof Token ? currency1.address : currency1 === ETHER ? 'SGB' : '')

                          const counter = await orderbookcontract.orderCounter()
                          console.log(counter)
                          try {
                            if (address0 !== "SGB") {
                              const con = getBep20Contract(address0, library.getSigner());
                              const tx = await con.approve(getOrderBookAddress(), new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString())
                              const receipt = await tx.wait();
                              setIsapproved(true);
                            }


                          }
                          catch (err) {
                            console.log(err)
                          }
                        }}
                        id="swap-button"
                        width="100%"
                        disabled={!isValid || !isValidLimitPrice}
                      >
                        Approve
                      </CustomOrderButton>
                    )}

                  {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                </Box>
               


                <div className='header'> {!swapIsUnsupported ? (
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

      {/* <Flex width="100%" justifyContent="center" position="relative">
        <Flex width="100%" flexDirection="column" >

          {!isMobile && (

            <PriceChartContainer

              inputCurrencyId={inputCurrencyId}
              inputCurrency={currencies[Field.INPUT]}
              outputCurrencyId={outputCurrencyId}
              outputCurrency={currencies[Field.OUTPUT]}
              isChartExpanded={isChartExpanded}
              setIsChartExpanded={setIsChartExpanded}
              isChartDisplayed={isChartDisplayed}
              currentSwapPrice={singleTokenPrice}
            />


          )}
          <BottomDrawer
            content={
              <PriceChartContainer
                inputCurrencyId={inputCurrencyId}
                inputCurrency={currencies[Field.INPUT]}
                outputCurrencyId={outputCurrencyId}
                outputCurrency={currencies[Field.OUTPUT]}
                isChartExpanded={isChartExpanded}
                setIsChartExpanded={setIsChartExpanded}
                isChartDisplayed={isChartDisplayed}
                currentSwapPrice={singleTokenPrice}
                isMobile
              />
            }
            isOpen={isChartDisplayed}
            setIsOpen={setIsChartDisplayed}
          />
          <br />
          <br />
          <Flex flex="1" justifyContent="center" mb="24px">
            <Card style={{ width: '100%', height: 'max-content' }}>
              <LimitOrderTable />
              {isChartDisplayed}
              <Flex justifyContent="center">
                <Box ml="auto" mr="auto" width="90%">
                  <Table>
                    <thead>
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
                        <Th><Text fontSize="12px" bold textTransform="uppercase" color="textSubtle" textAlign="left">
                          AMOUNT
                        </Text></Th>
                        <Th><Text fontSize="12px" bold textTransform="uppercase" color="textSubtle" textAlign="left">
                          LIMIT PRICE
                        </Text></Th>
                        <Th>{"".concat("")}</Th>
                      </tr>
                    </thead>
                    <tbody>

                      {orderlist}
                    </tbody>
                  </Table>
                </Box>
              </Flex>
            </Card>
          </Flex>

        </Flex>
        <Flex flexDirection="column">
          <StyledSwapContainer $isChartExpanded={isChartExpanded}>
            <StyledInputCurrencyWrapper mt={isChartExpanded ? '24px' : '0'} mr={isChartExpanded ? '0' : '0'}>

              <AppBody>
                <CurrencyInputHeader
                  title={t('Limit')}
                  subtitle={t('Place a limit order to trade at a set price')}
                  setIsChartDisplayed={setIsChartDisplayed}
                  isChartDisplayed={isChartDisplayed}
                />
                <Wrapper id="swap-page">
                  <AutoColumn gap="md">
                    <CurrencyInputPanel
                      label={
                        independentField === Field.OUTPUT && !showWrap && trade ? t('From (estimated)') : t('From')
                      }
                      value={formattedAmounts[Field.INPUT]}
                      showMaxButton={!atMaxAmountInput}
                      currency={currencies[Field.INPUT]}
                      onUserInput={handleTypeInput}
                      onMax={handleMaxInput}
                      onCurrencySelect={handleInputSelect}
                      otherCurrency={currencies[Field.OUTPUT]}
                      id="swap-currency-input"
                    />
                    <AutoColumn justify="space-between">
                      <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                        <IconButton variant="light" scale="sm">
                          <ArrowDownIcon
                            width="16px"
                            onClick={() => {
                              setApprovalSubmitted(false) // reset 2 step UI for approvals
                              onSwitchTokens()
                            }}
                            color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? 'primary' : 'text'}
                          />
                        </IconButton>
                        {recipient === null && !showWrap && isExpertMode ? (
                          <Button variant="text" id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                            {t('+ Add a send (optional)')}
                          </Button>
                        ) : null}
                      </AutoRow>
                    </AutoColumn>
                    <CurrencyInputPanel
                      value={formattedAmounts[Field.OUTPUT]}
                      onUserInput={handleTypeOutput}
                      label={independentField === Field.INPUT && !showWrap && trade ? t('To (estimated)') : t('To')}
                      showMaxButton={false}
                      currency={currencies[Field.OUTPUT]}
                      onCurrencySelect={handleOutputSelect}
                      otherCurrency={currencies[Field.INPUT]}
                      id="swap-currency-output"
                    />

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
                  <Box mt="1rem">
                    <Flex width="100%" justifyContent="left" position="relative">
                      <Text fontWeight="bold" fontSize='0.8rem'>Price:</Text>
                      &nbsp;&nbsp;
                      <Button onClick={() => {
                        selectedPrice.current.value = (formattedAmounts[Field.OUTPUT])
                      }} scale='xs'><svg viewBox="0 0 24 24" color="textDisabled" width="20px" xmlns="http://www.w3.org/2000/svg" ><path d="M12 6V7.79C12 8.24 12.54 8.46 12.85 8.14L15.64 5.35C15.84 5.15 15.84 4.84 15.64 4.64L12.85 1.85C12.54 1.54 12 1.76 12 2.21V4C7.58 4 4 7.58 4 12C4 13.04 4.2 14.04 4.57 14.95C4.84 15.62 5.7 15.8 6.21 15.29C6.48 15.02 6.59 14.61 6.44 14.25C6.15 13.56 6 12.79 6 12C6 8.69 8.69 6 12 6ZM17.79 8.71C17.52 8.98 17.41 9.4 17.56 9.75C17.84 10.45 18 11.21 18 12C18 15.31 15.31 18 12 18V16.21C12 15.76 11.46 15.54 11.15 15.86L8.36 18.65C8.16 18.85 8.16 19.16 8.36 19.36L11.15 22.15C11.46 22.46 12 22.24 12 21.8V20C16.42 20 20 16.42 20 12C20 10.96 19.8 9.96 19.43 9.05C19.16 8.38 18.3 8.2 17.79 8.71Z" /></svg> MARKET</Button>
                    </Flex>
                    &nbsp;&nbsp;&nbsp;&nbsp;

                    <StyledInput
                      style={{ background: "#eeeaf4", borderRadius: "10px" }}
                      placeholder='0'
                      ref={selectedPrice}
                      onChange={async e => {
                        if (e.target.value > formattedAmounts[Field.OUTPUT]) {
                          const currency0 = currencies[Field.INPUT];
                          const address0 = (currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : '')
                          if (address0 !== "SGB") {
                            const con = getBep20Contract(address0, library.getSigner());

                            if ((await con.allowance(account, getOrderBookAddress())) < new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString())
                              setIsapproved(false);
                            else
                              setIsapproved(true)
                          }
                          setIsValidLimitPrice(true)
                        }
                        else {
                          setIsValidLimitPrice(false)
                        }
                      }}

                    />
                    {Boolean(trade) && (
                      <RowBetween align="center">
                        <span />
                        <TradePrice
                          price={trade?.executionPrice}
                          showInverted={showInverted}
                          setShowInverted={setShowInverted}
                        />
                      </RowBetween>
                    )}
                  </Box>
                  <Box mt="1rem">
                    {swapIsUnsupported ? (
                      <Button width="100%" disabled mb="4px">
                        {t('Unsupported Asset')}
                      </Button>
                    ) : !account ? (
                      <ConnectWalletButton width="100%" />
                    ) : showWrap ? (
                      <Button width="100%" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                        {wrapInputError ??
                          (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                      </Button>
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
                    ) :
                      (isapproved ?
                        <Button
                          variant='primary'
                          onClick={async () => {
                            const currency0 = currencies[Field.INPUT];
                            const address0 = (currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : '')
                            const currency1 = currencies[Field.OUTPUT];
                            const address1 = (currency1 instanceof Token ? currency1.address : currency1 === ETHER ? 'SGB' : '')
                            let url = ''
                            let tx;
                            const counter = await orderbookcontract.orderCounter()
                            console.log(counter)
                            try {
                              if (address0 === "SGB") {
                                url = 'https://sgborder.herokuapp.com/placeorder?id='.concat(counter).concat('&owner=').concat(account).concat('&fromtoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED').concat('&totoken=').concat(address1).concat('&amount=').concat(new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString()).concat('&price=').concat(new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString());
                                console.log(0, url)
                                tx = await orderbookcontract.placeETHorder(address1, new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString(), new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString(), { value: new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString() })
                              }
                              else if (address1 === "SGB") {

                                url = 'https://sgborder.herokuapp.com/placeorder?id='.concat(counter).concat('&owner=').concat(account).concat('&fromtoken=').concat(address0).concat('&totoken=0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED').concat('&amount=').concat(new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString()).concat('&price=').concat(new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString());
                                console.log(1, url)

                                tx = await orderbookcontract.placeTokenorder(address0, "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED", new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString(), new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString())
                              }
                              else {
                                url = 'https://sgborder.herokuapp.com/placeorder?id='.concat(counter).concat('&owner=').concat(account).concat('&fromtoken=').concat(address0).concat('&totoken=').concat(address1).concat('&amount=').concat(new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString()).concat('&price=').concat(new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString());
                                console.log(2, url)
                                const con = getBep20Contract(address0, library.getSigner());


                                tx = await orderbookcontract.placeTokenorder(address0, address1, new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString(), new BigNumber(selectedPrice.current.value).times(BIG_TEN.pow(currencies[Field.OUTPUT].decimals)).toString())
                              }

                              const receipt = await tx.wait()
                              console.log(receipt)
                              const res = await axios.get(url, {})
                              setCorderid(corderid + 1);
                              console.log(res)
                            }
                            catch (err) {
                              console.log(err)
                            }
                          }}
                          id="swap-button"
                          width="100%"
                          disabled={!isValid || !isValidLimitPrice}
                        >
                          Place an Order
                        </Button>
                        :
                        <Button
                          variant='primary'
                          onClick={async () => {
                            const currency0 = currencies[Field.INPUT];
                            const address0 = (currency0 instanceof Token ? currency0.address : currency0 === ETHER ? 'SGB' : '')
                            const currency1 = currencies[Field.OUTPUT];
                            const address1 = (currency1 instanceof Token ? currency1.address : currency1 === ETHER ? 'SGB' : '')

                            const counter = await orderbookcontract.orderCounter()
                            console.log(counter)
                            try {
                              if (address0 !== "SGB") {
                                const con = getBep20Contract(address0, library.getSigner());
                                const tx = await con.approve(getOrderBookAddress(), new BigNumber(formattedAmounts[Field.INPUT]).times(BIG_TEN.pow(currencies[Field.INPUT].decimals)).toString())
                                const receipt = await tx.wait();
                                setIsapproved(true);
                              }


                            }
                            catch (err) {
                              console.log(err)
                            }
                          }}
                          id="swap-button"
                          width="100%"
                          disabled={!isValid || !isValidLimitPrice}
                        >
                          Approve
                        </Button>
                      )}

                    {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                  </Box>
                </Wrapper>
              </AppBody>
              {!swapIsUnsupported ? (
                trade && <AdvancedSwapDetailsDropdown trade={trade} />
              ) : (
                <UnsupportedCurrencyFooter currencies={[currencies.INPUT, currencies.OUTPUT]} />
              )}
            </StyledInputCurrencyWrapper>
          </StyledSwapContainer>
          {isChartExpanded && (
            <Box display={['none', null, null, 'block']} width="100%" height="100%">
              <Footer variant="side" />
            </Box>
          )}
        </Flex>

      </Flex> */}


    </Page>
  )
}


