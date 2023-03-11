const getTokenLogoURL = (address: string) => {
  
  return `/images/tokens/${address}.png`
  // `https://assets.trustwalletapp.com/blockchains/smartchain/assets/${address}/logo.png`

}

export default getTokenLogoURL
