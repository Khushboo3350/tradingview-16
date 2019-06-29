import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  componentDidMount() {
    this.initOnReady()
  }
  initOnReady = () => {
    window.tvWidget = new window.TradingView.widget({
      // debug: true, // uncomment this line to see Library errors and warnings in the console
      fullscreen: true,
      // width: 960,
      // height: 500,
      symbol: 'AAPL',
      interval: 'D',
      container_id: "App",

      //	BEWARE: no trailing slash is expected in feed URL
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
      library_path: "charting_library/",
      // locale: getParameterByName('lang') || "en",
      locale: "zh",

      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: 'http://saveload.tradingview.com',
      charts_storage_api_version: "1.1",
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      theme: 'Light',
    })
    window.addEventListener('DOMContentLoaded', this.initOnReady, false)
  }
  render() {
    return (
      <div id="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
