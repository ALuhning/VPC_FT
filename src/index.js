import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route } from "react-router-dom";
import App from './App'
import { initContract } from './utils'

window.nearInitPromise = initContract()
  .then(() => {
    ReactDOM.render(
      <BrowserRouter>
        <Route path="/" component={App} />
      </BrowserRouter>,
      document.querySelector('#root')
    )
  })
  .catch(console.error)
