import React from 'react'
import { Currency, Pair } from 'canaryx-sdk'
import { Button, ChevronDownIcon, Text, useModal, Flex, Box } from 'canaryx-uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { CurrencyLogo, DoubleCurrencyLogo } from '../Logo'

import { RowBetween } from '../Layout/Row'
import { Input as NumericalInput } from './NumericalInput'

// const InputRow = styled.div<{ selected: boolean }>`
//   display: flex;
//   flex-flow: row nowrap;
//   align-items: center;
//   justify-content: flex-end;
//   /* padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')}; */
// `
const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })`
  padding: 0 0.5rem;
`
const LabelRow = styled.div`
  display: flex;
  height: 100%;
`
const InputPanel = styled.div`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  z-index: 1;
  background: #ffffff;
  border: 1px solid #d8dce1;
  border-radius: 2px;
  height: 38px;
`
const Container = styled.div`
  border-radius: 2px;
  // background: ${({ theme }) => theme.colors.input};
  box-shadow: ${({ theme }) => theme.shadows.inset};
  height: 100%;
`
export const TextCustom = styled(Text)`
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.48px;
  color: #8c8d91;
`
const NumericalInputCustom = styled(NumericalInput)`
  padding: 0 12px;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 12px;
  letter-spacing: 0.36px;
`

const StyledButton = styled(Button)`
  width: 48px;
  height: 25px;
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
`

const buttonsConfig = [
  {
    buttonLabel: '25%',
    buttonValue: 0.25,
  },
  { buttonLabel: '50%', buttonValue: 0.5 },
  { buttonLabel: '75%', buttonValue: 0.75 },
  { buttonLabel: '100%', buttonValue: 1 },
]
interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  onCurrencySelect: (currency: Currency) => void
  onPercentChange?: (buttonValue: number) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
}
export function CurrencyInputPanelCustom({
  value,
  onUserInput,
  onMax,
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  otherCurrency,
  id,
  showCommonBases,
  onPercentChange,
}: CurrencyInputPanelProps) {
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const { t } = useTranslation()

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={currency}
      otherSelectedCurrency={otherCurrency}
      showCommonBases={showCommonBases}
    />,
  )
  return (
    <Box id={id} style={{ paddingTop: 24 }}>
      <Flex mb="6px" alignItems="center" justifyContent="space-between">
        <CurrencySelectButton
          className="open-currency-select-button"
          selected={!!currency}
          onClick={() => {
            if (!disableCurrencySelect) {
              onPresentCurrencyModal()
            }
          }}
        >
          <Flex alignItems="center" justifyContent="space-between">
            {pair ? (
              <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
            ) : currency ? (
              <CurrencyLogo currency={currency} size="24px" style={{ marginRight: '8px' }} />
            ) : null}
            {pair ? (
              <TextCustom id="pair">
                {pair?.token0.symbol}:{pair?.token1.symbol}
              </TextCustom>
            ) : (
              <TextCustom id="pair">
                {(currency && currency.symbol && currency.symbol.length > 20
                  ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                      currency.symbol.length - 5,
                      currency.symbol.length,
                    )}`
                  : currency?.symbol) || t('Select a currency')}
              </TextCustom>
            )}
            {!disableCurrencySelect && <ChevronDownIcon />}
          </Flex>
        </CurrencySelectButton>
        {account && (
          <Text onClick={onMax} color="textSubtle" fontSize="12px" style={{ display: 'inline', cursor: 'pointer' }}>
            {!hideBalance && !!currency
              ? t('Balance: %balance%', { balance: selectedCurrencyBalance?.toSignificant(6) ?? t('Loading') })
              : ' -'}
          </Text>
        )}
      </Flex>
      <InputPanel>
        <Container>
          <LabelRow>
            <RowBetween>
              <NumericalInputCustom
                className="token-amount-input"
                value={value}
                onUserInput={(val) => {
                  onUserInput(val)
                }}
              />
            </RowBetween>
          </LabelRow>
          <Flex paddingTop="5px">
            {buttonsConfig.map(({ buttonLabel, buttonValue }) => (
              <StyledButton onClick={() => onPercentChange(buttonValue)}>{buttonLabel}</StyledButton>
            ))}
          </Flex>
          {/* <InputRow selected={disableCurrencySelect}>
            {account && currency && showMaxButton && label !== 'To' && (
              <Button onClick={onMax} scale="xs" variant="secondary">
                MAX
              </Button>
            )}
          </InputRow> */}
        </Container>
      </InputPanel>
    </Box>
  )
}
