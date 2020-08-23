import 'regenerator-runtime/runtime'
import 'fontsource-roboto';
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
  const [accountBalance, setAccountBalance] = useState()
  const [precision, setPrecision] = useState()
  const [transferEvents, setTransferEvents] = useState([])
  const [mintEvents, setMintEvents] = useState([])
  const [burnEvents, setBurnEvents] = useState([])
  const [ownerTransferEvents, setOwnerTransferEvents] = useState([])
  const [tabValue, setTabValue] = useState('1')

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

  async function handleTransferEventChange() {
    try {
      let currentTransferEvents = await window.contract.getAllTransferEvents()
      if(currentTransferEvents){
        setTransferEvents(currentTransferEvents)
      }
      return true
    } catch (err) {
      return false
    }
  }

  async function handleMintEventChange() {
    try {
      let currentMintEvents = await window.contract.getAllMintEvents()
      if(currentMintEvents){
        setMintEvents(currentMintEvents)
      }
      return true
    } catch (err) {
      return false
    }
  }

  function handleTabValueState(value) {
    setTabValue(value)
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
          try {
            // window.contract is set in utils.js after being called by initContract in index.js
            let balance = await window.contract.get_balance({owner_id: window.accountId})
            setAccountBalance(balance)
          } catch (err) {
            console.log('no balance')
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

        async function fetchMintData() {
          try {
            let mints = await window.contract.getAllMintEvents()
            console.log('mints', mints)
            if(mints.length != 0) {
              setMintEvents(mints)
            }
          } catch (err) {
            console.log('error retrieving mint events')
            return false
          }
        }
        
        fetchMintData()
          .then((res) => {
            console.log('minting records exist', res)
          })

        async function fetchBurnData() {
          try {
            let burns = await window.contract.getAllBurnEvents()
            console.log('burns', burns)
            if(burns.length != 0) {
              setBurnEvents(burns)
            }
          } catch (err) {
            console.log('error retrieving burn events')
            return false
          }
        }
        
        fetchBurnData()
          .then((res) => {
            console.log('burn records exist', res)
          })

        async function fetchOwnerTransferData() {
          try {
            let ots = await window.contract.getAllOwnerTransferEvents()
            console.log('ownership transfers', ots)
            if(ots.length != 0) {
              setOwnerTransferEvents(ots)
            }
          } catch (err) {
            console.log('error retrieving ownership transfer events')
            return false
          }
        }
        
        fetchOwnerTransferData()
          .then((res) => {
            console.log('owner transfer records exist', res)
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

  async function poll() {
    const latestHash = (await window.near.connection.provider.status()).sync_info.latest_block_hash;
      console.log('latest Hash', latestHash)
    const latestBlock = await near.connection.provider.block(latestHash);
    console.log('latestBlock', latestBlock)

    let startBlockId = await latestBlock.header.hash
    console.log('start block Id', startBlockId)
    let stopBlockId = 1
    let i = 0
    let currentBlockId = startBlockId
    let currentBlock = latestBlock
    while(currentBlockId != stopBlockId) {
      currentBlock = await near.connection.provider.block(currentBlockId)
      console.log('current block id', currentBlockId)
      const changes = await fetch('https://rpc.testnet.near.org', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "icare",
          method: "EXPERIMENTAL_changes",
          params: {
            "block_id": currentBlockId,
            "changes_type": "data_changes",
            "account_ids": ["vpc.vitalpointai.testnet"],
            "key_prefix_base64": "U1RBVEU="
          },
        })
      })
      const jsonChanges = await changes.json()
      console.log('aloha jsonChanges', jsonChanges)
      const onlyChanges = jsonChanges.result.changes.map(c => c.change.value_base64)
      console.log('onlyChanges', onlyChanges)
      currentBlockId = await currentBlock.header.prev_hash
    }
  }

  //window.setInterval(poll, 2000)

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
          handleTransferEventChange={handleTransferEventChange}
          handleTabValueState={handleTabValueState}
          accountId={accountId}
          tokenName={tokenName} 
          tokenSymbol={tokenSymbol}
          currentSupply={totalSupply}
          initialSupply={initialSupply}
          tokenOwner={tokenOwner}
          done={done}
          transferEvents={transferEvents}
          mintEvents={mintEvents}
          burnEvents={burnEvents}
          ownerTransferEvents={ownerTransferEvents}
          accountBalance={accountBalance}
          tabValue={tabValue}
          />
      )
    }
  }
}
