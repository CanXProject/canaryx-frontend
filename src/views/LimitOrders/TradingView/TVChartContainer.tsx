/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react'
import { ChartingLibraryWidgetOptions, TradingTerminalWidgetOptions, widget } from '../../../charting_library'
import { sTradeapiLink } from './Constants'

interface ChartComponentProps {
  symbol: string
}
export const TVChartContainer: React.FC<ChartComponentProps> = (props) => {
  const defaultPropos = {
    // symbol: 'AAPL',
    symbol: 'WSGB/CANARY',
    interval: '1D',
    containerId: 'tv_chart_container',
    // datafeedUrl: 'https://demo_feed.tradingview.com',
    datafeedUrl: sTradeapiLink,
    libraryPath: '/charting_library/',
    chartsStorageUrl: 'https://saveload.tradingview.com',
    chartsStorageApiVersion: '1.1',
    clientId: 'tradingview.com',
    userId: 'public_user_id',
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
  }
  function getLanguageFromURL() {
    const regex = new RegExp('[\\?&]lang=([^&#]*)')
    const results = regex.exec(window.location.search)
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '))
  }
  const [tvWidget, setTvWidget] = useState(null)

  const ref = useRef()
  useEffect(() => {
    const widgetOptions = {
      container: ref.current,
      symbol: defaultPropos.symbol,
      // BEWARE: no trailing slash is expected in feed URL

      // @ts-ignore
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed(defaultPropos.datafeedUrl),
      // @ts-ingore
      interval: '1D',
      'has-intraday': true,
      has_intraday: true,
      container_id: defaultPropos.containerId,
      library_path: defaultPropos.libraryPath,
      locale: getLanguageFromURL() || ('en' as any),
      disabled_features: ['use_localstorage_for_settings', 'header_screenshot', 'header_saveload'],
      enabled_features: [],
      charts_storage_url: defaultPropos.chartsStorageUrl,
      charts_storage_api_version: defaultPropos.chartsStorageApiVersion as any,
      client_id: defaultPropos.clientId,
      user_id: defaultPropos.userId,
      fullscreen: defaultPropos.fullscreen,
      autosize: defaultPropos.autosize,
      studies_overrides: defaultPropos.studiesOverrides,
    }

    widgetOptions.datafeed.onReady(function (configuration) {
      configuration.supported_resolutions = ['1D', '2D', '3D', 'W', 'M', '3M']
      configuration.supports_marks = false
      configuration.supports_timescale_marks = false
    })
    const tvWidget1 = new widget(widgetOptions as any)

    setTvWidget(tvWidget1)
    // (window as any).tvWidget = tvWidget1;
  }, [])

  useEffect(() => {
    if (tvWidget == null) return
    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {})
    })
    return () => {
      if (tvWidget !== null) {
        tvWidget.remove()
        setTvWidget(null)
      }
    }
  }, [tvWidget])

  const [pairSymbol, setPairSymbol] = useState('')
  useEffect(() => {
    if (tvWidget === null || props.symbol === pairSymbol) return
    console.log('PairSymbol: ', props.symbol)
    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        tvWidget.setSymbol(props.symbol, 600000)
      })
    })
  }, [props.symbol])

  return <div id={defaultPropos.containerId} className={'TVChartContainer'} ref={ref} style={{ height: '100%' }} />
}
