import React, { Component } from 'react';
import './App.css';

let ws = null
// let klineAll = {
//   id: 8,
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
      HCk: null,
      SUB: null,
      historyData: [],
      lastTime: 0
    }
  }
  componentDidMount() {
    this.setDataFeed()
    this.webSocketInit()
  }
  // 需要等待setDataFeed动作结束
  widgetInit = () => {
    let _this = this
    window.tvWidget = new window.TradingView.widget({
      // debug: true, 
      fullscreen: false,
      width: 960,
      height: 500,
      symbol: 'BTCUSDT',
      interval: '15',
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
    // window.addEventListener('DOMContentLoaded', this.widgetInit, false)
  }
  // 设置配置数据
  setDataFeed = () => {
    let datafeed = {
      onReady: cb => {
        setTimeout(() => {
          cb(config)
        }, 0);
      },
      resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
        var symbol_stub = {
          name: symbolName,
          ticker: symbolName,
          description: "",
          has_intraday: true,
          has_no_volume: false,
          minmov: 1,
          minmov2: 2,
          pricescale: 100000,
          session: "24x7",
          supported_resolutions: ["1", "5", "15", "30", "60", "240", "1D", "1W", "1M"],
          timezone: "Asia/Shanghai",
          type: "stock"
        }
        setTimeout(() => {
          onSymbolResolvedCallback(symbol_stub)
        }, 0)
      },
      getBars: (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
        // 周期设置 -- 转换成秒
        resolution = this.timeConversion(resolution)
        this.setState({
          HCK: onHistoryCallback
        }, () => {
          let params = [symbolInfo.name, from, to, resolution]
          this.sendKlineQueryReq(params)
        })
      },
      subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
        resolution = this.timeConversion(resolution)
        let params = [
          symbolInfo.name,
          resolution
        ]
        this.setState({
          SUB: onRealtimeCallback
        }, () => {
          this.sendKlineSubReq(params)
        })
      }
    }
    this.setState({
      datafeed
    }, () =>{
      this.widgetInit()
    })
  }
  // websocket
  webSocketInit = () => {
    if ('WebSocket' in window) {
      if (ws === null) {
        ws = new WebSocket('wss://socket.coinex.com/')
      }
      ws.onopen = () => {
        console.log('连接成功')
        // ws.send(JSON.stringify(kline))
      }
      ws.onmessage = res => {
        this.WSHandler(JSON.parse(res.data))
      }
      ws.onclose = () => {
        console.log('连接关闭')
      }
    } else {
      console.log('您的浏览器不支持websocket')
    }
  }
  // websocket接受数据,处理数据
  WSHandler = res => {
    if (res.ttl === 400) {
      // 历史数据
      let historyData = res.result.map(val => {
        return {
          time: Number(val[0]) * 1000,
          close: Number(val[2]),
          open: Number(val[1]),
          high: Number(val[3]),
          low: Number(val[4]),
          volume: Number(val[5])
        }
      })
      this.setState({
        lastTime: historyData[historyData.length - 1].time,
        historyData
      }, () => {
        if (historyData && historyData.length) {
          setTimeout(() => {
            this.state.HCK(historyData, { noData: false })
          }, 0)
        } else {
          this.state.HCK(historyData, { noData: true })
        }
      })
    } 
    if (res.method === 'kline.update') {
      // 实时数据
      let bars = res.params.map(val => {
        return {
          time: Number(val[0]) * 1000,
          close: Number(val[2]),
          open: Number(val[1]),
          high: Number(val[3]),
          low: Number(val[4]),
          volume: Number(val[5])
        }
      })[0]
      // 对比存储的最新时间和最新数据的时间大小来更新数据
      if (this.state.lastTime - bars.time <= 0) {
        setTimeout(() => {
          this.state.SUB(bars)
        }, 0)
      }
    }
  }
  // 将周期转换成秒
  timeConversion = time => {
    switch(time) {
      case ('1M' || '1W' || '1D' || 'D'):
        return 86400
      case '240':
        return 14400
      case '120':
        return 7200
      case '60':
        return 3600
      case '30':
        return 1800
      case '15':
        return 900
      case '5':
        return 300
      case '1':
        return 60
      default:
        return 86400
    }
  }
  // websocket发送请求
  sendRequest = data => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(data))
    } else {
      ws.onopen = () => {
        ws.send(JSON.stringify(data))
      }
    }
  }
  // 发送历史数据请求
  sendKlineQueryReq = params => {
    let data = {
      id: 8,
      method: 'kline.query',
      params: params
    }
    this.sendRequest(data)
  }
  // 发送实时数据请求
  sendKlineSubReq = params => {
    let data = {
      id: 9,
      method: 'kline.subscribe',
      params: params
    }
    this.sendRequest(data)
  }
  render() {
    return (
      <div id="App">
      </div>
    );
  }
}

export default App;
