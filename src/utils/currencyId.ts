import { Currency, ETHER, Token } from 'canaryx-sdk'

export function currencyId(currency: Currency): string {
  if (currency === ETHER) return 'SGB'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}

export default currencyId
