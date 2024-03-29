import React, { lazy, useEffect } from 'react'
import { Router, Redirect, Route, Switch } from 'react-router-dom'
import { ResetCSS } from 'canaryx-uikit'
import BigNumber from 'bignumber.js'
import useEagerConnect from 'hooks/useEagerConnect'
import useUserAgent from 'hooks/useUserAgent'
import useScrollOnRouteChange from 'hooks/useScrollOnRouteChange'
import { usePollBlockNumber } from 'state/block/hooks'
import { usePollCoreFarmData } from 'state/farms/hooks'
import { DatePickerPortal } from 'components/DatePicker'
import { useUserSlippageTolerance } from 'state/user/hooks'
import Tokengen from 'views/Tokengen'
import GlobalStyle from './style/Global'
import Menu from './components/Menu'
import SuspenseWithChunkError from './components/SuspenseWithChunkError'
import { ToastListener } from './contexts/ToastsContext'
import PageLoader from './components/Loader/PageLoader'
import EasterEgg from './components/EasterEgg'
import history from './routerHistory'
// Views included in the main bundle
import Pools from './views/Pools'
import Swap from './views/Swap'
import LimitOrders from './views/LimitOrders/index'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity,
} from './views/AddLiquidity/redirects'
import RedirectOldRemoveLiquidityPathStructure from './views/RemoveLiquidity/redirects'
import { RedirectPathToSwapOnly, RedirectToSwap } from './views/Swap/redirects'
import { useInactiveListener } from './hooks/useInactiveListener'
// import { useWeb3React } from '@web3-react/core'
// import { useFetchProfile } from 'state/profile/hooks'
// import GlobalCheckClaimStatus from './components/GlobalCheckClaimStatus'
// import { nftsBaseUrl } from 'views/Nft/market/constants'


// Route-based code splitting
// Only pool is included in the main bundle because of it's the most visited page
const Home = lazy(() => import('./views/Home'))
const Farms = lazy(() => import('./views/Farms'))
const Ifos = lazy(() => import('./views/Ifos'))
const NotFound = lazy(() => import('./views/NotFound'))
const AddLiquidity = lazy(() => import('./views/AddLiquidity'))
const Liquidity = lazy(() => import('./views/Pool'))
const PoolFinder = lazy(() => import('./views/PoolFinder'))
const RemoveLiquidity = lazy(() => import('./views/RemoveLiquidity'))
// const FarmAuction = lazy(() => import('./views/FarmAuction'))
// const Lottery = lazy(() => import('./views/Lottery'))
// const Teams = lazy(() => import('./views/Teams'))
// const Team = lazy(() => import('./views/Teams/Team'))
// const TradingCompetition = lazy(() => import('./views/TradingCompetition'))
// const Predictions = lazy(() => import('./views/Predictions'))
// const PredictionsLeaderboard = lazy(() => import('./views/Predictions/Leaderboard'))
// const Voting = lazy(() => import('./views/Voting'))
// const Proposal = lazy(() => import('./views/Voting/Proposal'))
// const CreateProposal = lazy(() => import('./views/Voting/CreateProposal'))
// const Info = lazy(() => import('./views/Info'))
// const NftMarket = lazy(() => import('./views/Nft/market'))
// const ProfileCreation = lazy(() => import('./views/ProfileCreation'))
// const PancakeSquad = lazy(() => import('./views/PancakeSquad'))

// This config is required for number formatting
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const App: React.FC = () => {
  // const { account } = useWeb3React()

  usePollBlockNumber()
  useEagerConnect()
  // useFetchProfile()
  usePollCoreFarmData()
  useScrollOnRouteChange()
  useUserAgent()
  useInactiveListener()
  const [, setUserSlippageTolerance] = useUserSlippageTolerance()
  useEffect(() => {
    setUserSlippageTolerance(1800)
  }, [setUserSlippageTolerance])

  return (
    <Router history={history}>
      <ResetCSS />
      <GlobalStyle />

      <Menu>
        <SuspenseWithChunkError fallback={<PageLoader />}>
          <Switch>
            {/* <Route path="/" exact>
              <Home />
            </Route> */}
              <Route exact strict path="/" component={Swap} />


            <Route path="/farms">
              <Farms />
            </Route>
            <Route path="/pools">
              <Pools />
            </Route>
            <Route path="/ifo">
              <Ifos />
            </Route>

            <Route path="/tokengen">
              <Tokengen />
            </Route>

            {/* Using this format because these components use routes injected props. We need to rework them with hooks */}
            <Route exact strict path="/swap" component={Swap} />
            <Route exact strict path="/limitorders" component={LimitOrders} />
            <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
            <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
            <Route exact strict path="/find" component={PoolFinder} />
            <Route exact strict path="/liquidity" component={Liquidity} />
            <Route exact strict path="/create" component={RedirectToAddLiquidity} />
            <Route exact path="/add" component={AddLiquidity} />
            <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
            <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
            <Route exact path="/create" component={AddLiquidity} />
            <Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
            <Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
            <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
            <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />

            {/* Redirect */}
            <Route path="/pool">
              <Redirect to="/liquidity" />
            </Route>
            <Route path="/staking">
              <Redirect to="/pools" />
            </Route>

            {/* 404 */}
            <Route component={NotFound} />
          </Switch>
        </SuspenseWithChunkError>
      </Menu>
      <EasterEgg iterations={2} />
      <ToastListener />
      <DatePickerPortal />
    </Router>
  )
}

export default React.memo(App)
