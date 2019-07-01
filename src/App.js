import React, { Component } from 'react';
import './App.css';

let socket = null
let klineAll = {
  id: 8,
  method: 'kline.query',
  params: ['BTCUSDT', 1560686476, 1561982536, 900]
}
// let kline = {
//   id: 9,
//   method: 'kline.query',
//   params: ['BTCUSDT', 1560686476, 1561982536, 900]
// }

const config = {
  supports_search: false,
  supports_group_request: false,
  supported_resolutions : ["1", "5", "15", "30", "60", "1D", "1W"],
  supports_marks: true,
  supports_time: true,
  exchanges: [
    {
      value: 'BCH',
      name: 'All Exchanges',
      desc: ''
    }
  ]
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      datafeed: null,
      bars: []
    }
  }
  componentDidMount() {
    this.webSocketInit()
  }
  widgetInit = () => {
    let _this = this
    window.tvWidget = new window.TradingView.widget({
      // debug: true, 
      fullscreen: true,
      symbol: 'AAPL',
      interval: 'D',
      container_id: "App",
      // datafeed: new window.Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
      datafeed: _this.state.datafeed,
      library_path: "charting_library/",
      // locale: getParameterByName('lang') || "en",
      locale: "zh",
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: 'http://saveload.tradingview.com',
      charts_storage_api_version: "1.1",
      client_id: 'tradingview.com',
      user_id: 'public_user_id'
    })
    window.addEventListener('DOMContentLoaded', this.widgetInit, false)
  }
  setDataFeed = () => {
    let datafeed = {
      onReady: cb => {
        console.log('onReady')
        setTimeout(() => {
          cb(config)
        }, 0);
      },
      resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
        var symbol_stub = {
          name: symbolName,
          description: "",
          has_intraday: true,
          has_no_volume: false,
          minmov: 1,
          minmov2: 2,
          pricescale: 100,
          session: "24x7",
          supported_resolutions: ["1", "5", "15", "30", "60", "1D", "1W"],
          ticker: symbolName,
          timezone: "Asia/Shanghai",
          type: "stock"
        }
        setTimeout(() => onSymbolResolvedCallback(symbol_stub), 0);
      },
      getBars: (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
        setInterval(() => {
          let bars = this.state.bars
          // let bars = {
          //   time: 1561989700 * 1000,
          //   close: '10941.13',
          //   open: '10982.67',
          //   high: '10989.60',
          //   low: '10935.76',
          //   volume: '33963.2266664469' 
          // }
          console.log(bars)
          let meta = {
            noData: false
          }
          setTimeout(() => {
            onHistoryCallback(bars, meta)
          })
        }, 0)
      },
      subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
        // let bar = this.state.bars
        let bar = {
          time: 1565989700 * 1000,
          close: '10941.13',
          open: '10982.67',
          high: '10989.60',
          low: '10935.76',
          volume: '33963.2266664469' 
        }
        setTimeout(() => {
          onRealtimeCallback(bar)
        });
      }
    }
    this.setState({
      datafeed
    }, () => {
      // setState异步，需在datafeed设置完成后调用
      this.widgetInit()
    })
  }
  webSocketInit = () => {
    if ('WebSocket' in window) {
      if (socket === null) {
        socket = new WebSocket('wss://socket.coinex.com/')
      }
      socket.onopen = () => {
        console.log('连接成功')
        socket.send(JSON.stringify(klineAll))
        // socket.send(JSON.stringify(kline))
      }
      socket.onmessage = res => {
        this.socketUpdate(JSON.parse(res.data))
      }
      socket.onclose = () => {
        console.log('连接关闭')
      }
    } else {
      console.log('您的浏览器不支持websocket')
    }
  }
  socketUpdate = res => {
    if (res.ttl === 400) {
      let bars = res.result.slice(0, 20).map((val, i) => {
        return {
          time: val[0],
          close: val[1],
          open: val[2],
          high: val[3],
          low: val[4],
          volume: val[5]
        }
      })
      this.setState({
        bars
      }, () => {
        this.setDataFeed()
      })
    }
  }
  render() {
    return (
      <div id="App">
        
      </div>
    );
  }
}

export default App;
