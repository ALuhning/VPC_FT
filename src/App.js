import 'regenerator-runtime/runtime'
import React, { useState, useEffect } from 'react'

// Material UI imports
import LinearProgress from '@material-ui/core/LinearProgress'

// DApp component imports
import SignIn from './components/common/SignIn/signIn'
import Initialize from './components/Initialize/initialize'
import TokenData from './components/TokenData/tokenData'

// import stylesheets
import './global.css'

export default function App() {

  // state setup
  const [loggedIn, setLoginState] = useState(false)
  const [initialized, setInit] = useState(false)
  const [done, setDone] = useState(false)
  const [accountId, setAccountId] = useState()
  const [tokenOwner, setTokenOwner] = useState()
  const [initialSupply, setInitialSupply] = useState()
  const [totalSupply, setTotalSupply] = useState()
  const [tokenName, setTokenName] = useState()
  const [tokenSymbol, setTokenSymbol] = useState()
  const [precision, setPrecision] = useState()
  const [transferEvents, setTransferEvents] = useState([])
  const [transfers, setTransfers] = useState(false)

  function handleInitChange(newState) {
    setInit(newState)
  }

  function handleOwnerChange(newOwner) {
    setTokenOwner(newOwner)
  }

  async function handleSupplyChange() {
    try {
    let currentSupply = await window.contract.get_total_supply()
    setTotalSupply(currentSupply)
    return true
    } catch (err) {
    return false
    }
  }

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  useEffect(
      () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {
        setLoginState(true)
        setAccountId(window.accountId)
        
        async function fetchData() {
          try {
          // retrieve Token Name and set state
          try {
            // window.contract is set in utils.js after being called by initContract in index.js
            let name = await window.contract.getTokenName()
            setTokenName(name)
          } catch (err) {
            console.log('token name not set yet')
            return false
          }
          
          // retrieve Token Symbol and set state
          try {
            let symbol = await window.contract.getTokenSymbol()
            setTokenSymbol(symbol)
          } catch (err) {
            console.log('token symbol not set yet')
            return false
          }

          // retrieve Token Precision and set state
          try {
            let decimals = await window.contract.getPrecision()
            setPrecision(decimals)
          } catch (err) {
            console.log('precision not set yet')
            return false
          }

          // retrieve Initial Supply and set state
          try {
            let startSupply = await window.contract.getInitialSupply()
            setInitialSupply(startSupply)
          } catch (err) {
            console.log('initial supply not set yet')
            return false
          }

          // retrieve current Total Supply and set state
          try {
            let currentSupply = await window.contract.get_total_supply()
            setTotalSupply(currentSupply)
          } catch (err) {
            console.log('total supply not set yet')
            return false
          }

           // retrieve current token owner and set state
           try {
            let owner = await window.contract.getOwner()
            setTokenOwner(owner)
          } catch (err) {
            console.log('no owner yet')
            return false
          }
        
          } catch (err) {
            setDone(false)
            return false
          }
          return true
        }
        fetchData()
          .then((res) => {
            res ? setInit(true) : setInit(false)
            setDone(true)
          })

        async function fetchTransferData() {
          try {
            let transfers = await window.contract.getAllTransferEvents()
            console.log('transfers', transfers)
            if(transfers.length != 0) {
              setTransferEvents(transfers)
            }
          } catch (err) {
            console.log('error retrieving transfers')
            return false
          }
        }
        
        fetchTransferData()
          .then((res) => {
            console.log('transfer records exist', res)
          })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // it compares current value and if different - re-renders
    [initialized, tokenOwner]
  )

  // if not signed in, return early with sign-in component
  if (!window.walletConnection.isSignedIn()) {
    return (<SignIn />)
  }

  // if not done loading all the data, show a progress bar, otherwise show the content
  if(!done) {
    return <LinearProgress />
  } else {
    if(!initialized) {
      return (
        <Initialize
          accountId={accountId}
          done={done} 
          handleInitChange={handleInitChange} 
          initialized={initialized}
        />
      )
    } else {
      return (
        <TokenData
          handleOwnerChange={handleOwnerChange}
          handleSupplyChange={handleSupplyChange}
          accountId={accountId}
          tokenName={tokenName} 
          tokenSymbol={tokenSymbol}
          currentSupply={totalSupply}
          tokenOwner={tokenOwner}
          done={done}
          transferEvents={transferEvents}
          />
      )
    }
  }
}
