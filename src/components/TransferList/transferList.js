import React, { useState } from 'react'
import TransferTable from '../TransferTable/transferTable'
import MintTable from '../MintTable/mintTable'
import BurnTable from '../BurnTable/burnTable'
import OwnerTransferTable from '../OwnershipTransferTable/ownerTransferTable'
import BalanceChart from '../BalanceGraphs/balanceGraph'
import DistributionGraph from '../DistributionGraph/distributionGraph'

// Material UI Components
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import TabContext from '@material-ui/lab/TabContext'
import Tab from '@material-ui/core/Tab'
import TabList from '@material-ui/lab/TabList'
import TabPanel from '@material-ui/lab/TabPanel'
import AppBar from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  appBar: {
      font: '70%'
  }
});

export default function TransferList(props) {
  const classes = useStyles()
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.only('xs'))
  const { transferEvents, 
    mintEvents,
    burnEvents,
    ownerTransferEvents,
    tokenOwner, 
    accountId, 
    initialSupply, 
    accountBalance,
    tabValue,
    handleTabValueState } = props

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
  };

  const handleTabChange = (event, newValue) => {
      handleTabValueState(newValue);
  };

  let transferList = []
  let runningBalance = 0
  let mintRunningBalance = 0
  let burnRunningBalance = 0
  let accountBalanceGraphData = []
  let mintBalanceGraphData = []
  let burnBalanceGraphData = []

  if(tokenOwner == accountId) {
    runningBalance = parseInt(initialSupply)
  } else {
    runningBalance = parseInt(accountBalance)
  }

  if (transferEvents.length > 0) {
        transferEvents.map(transfer => {
          if(accountId != tokenOwner) {
              if (transfer.to == accountId || transfer.from == accountId) {
              transferList.push([{id: transfer.id, spender: transfer.spender, from: transfer.from, to: transfer.to, value: transfer.value, date: transfer.date, runningBalance: runningBalance.toString()}])
              accountBalanceGraphData.push([transfer.id, parseInt(runningBalance)])
              if(transfer.to != accountId) {
                runningBalance += parseInt(transfer.value)
              } else {
                runningBalance -= parseInt(transfer.value)
              }
            } 
            } else {
              transferList.push([{id: transfer.id, spender: transfer.spender, from: transfer.from, to: transfer.to, value: transfer.value, date: transfer.date}])
            }
        })
  }

  const uniqueAccounts = [[0,1]]
  const revList = transferList.reverse()
  const map = new Map();
  for (const item of revList) {
      if(!map.has(item[0].to)){
          map.set(item[0].to, true);    // set any value to Map
          if(item[0].to != '0x0') {  // don't include the token account
          uniqueAccounts.push([parseInt(item[0].date), uniqueAccounts.length+1]);
          console.log('uniqueaccounts', uniqueAccounts)
          }
      }
  }
  
  let mintList = []

  if (mintEvents.length > 0) {
    mintEvents.map(mint => {
        mintRunningBalance += parseInt(mint.value)
        mintList.push([{id: mint.id, owner: mint.owner, value: mint.value, date: mint.date, mintRunningBalance: mintRunningBalance}])
        mintBalanceGraphData.push([mintList.length, parseInt(mintRunningBalance)])
        console.log('mint graph data', mintBalanceGraphData)
       
    })
  }

  let burnList = []

  if (burnEvents.length > 0) {
    burnEvents.map(burn => {
        burnRunningBalance += parseInt(burn.value)
        burnList.push([{id: burn.id, owner: burn.owner, value: burn.value, date: burn.date, burnRunningBalance: burnRunningBalance}])
        burnBalanceGraphData.push([burnList.length, parseInt(burnRunningBalance)])
        console.log('burn graph data', burnBalanceGraphData)
        
    })
  }

  let otList = []

  if (ownerTransferEvents.length > 0) {
    ownerTransferEvents.map(ot => {
        otList.push([{id: ot.id, owner: ot.owner, newOwner: ot.newOwner, date: ot.date}])        
    })
  }

  return (
    <>
    
    {tokenOwner != accountId && tabValue == 1 && transferList.length > 0 ? <><Typography variant="button" display="block">Account Balance</Typography><BalanceChart graphData={accountBalanceGraphData} /></> : null }
    {tokenOwner == accountId && tabValue == 1 && uniqueAccounts.length > 0 ? <><Typography variant="button" display="block"># Unique Accounts</Typography><DistributionGraph graphData={uniqueAccounts} /></> : null }
    {tokenOwner == accountId && tabValue == 2 && mintList.length > 0 ? <><Typography variant="button" display="block">Total Minted</Typography><BalanceChart graphData={mintBalanceGraphData} /> </>: null }
    {tokenOwner == accountId && tabValue == 3 && burnList.length > 0 ? <><Typography variant="button" display="block">Total Burned</Typography><BalanceChart graphData={burnBalanceGraphData} /> </>: null }

    {tokenOwner==accountId
      ?
      ( <TabContext value={tabValue}>
        <AppBar position="static">
      {!matches 
        ? <TabList onChange={handleTabChange} aria-label="simple tabs example" variant="fullWidth">
            <Tab className="appBar" label="Transfers" value="1" />
            <Tab label="Mints" value="2"/>
            <Tab label="Burns" value="3" />
            <Tab label="Owners" value="4" />
          </TabList>
        : <TabList onChange={handleTabChange} aria-label="simple tabs example">
            <Tab className="appBar" label="Transfers" value="1" />
            <Tab label="Mints" value="2"/>
            <Tab label="Burns" value="3" />
            <Tab label="Owners" value="4" />
          </TabList>
      }
      </AppBar>
      <TabPanel value="1">{(transferEvents.length > 0 ? <TransferTable transferList={transferList.reverse()} eventCount={transferList.length} matches={matches} tokenOwner={tokenOwner} accountId={accountId}/> : <div style={{marginTop: 10, marginBottom: 10}}>No Transfer Events</div>)}</TabPanel>
      <TabPanel value="2">{(mintEvents.length > 0 ? <MintTable mintList={mintList} eventCount={mintList.length} matches={matches} /> : <div style={{marginTop: 10, marginBottom: 10}}>No Minting Events</div>)}</TabPanel>
      <TabPanel value="3">{(burnEvents.length > 0 ? <BurnTable burnList={burnList} eventCount={burnList.length} matches={matches} /> : <div style={{marginTop: 10, marginBottom: 10}}>No Burn Events</div>)}</TabPanel>
      <TabPanel value="4">{(ownerTransferEvents.length > 0 ? <OwnerTransferTable otList={otList} eventCount={otList.length} matches={matches} /> : <div style={{marginTop: 10, marginBottom: 10}}>No Ownership Transfers</div>)}</TabPanel>
    </TabContext>)
    :  (<TabContext value={tabValue}>
        <AppBar position="static">
        {!matches 
          ? <TabList onChange={handleTabChange} aria-label="simple tabs example" variant="fullWidth">
              <Tab className="appBar" label="Transfers" value="1" align="left" />
              <Tab label="" value="1"/>
            </TabList>
          : <TabList onChange={handleTabChange} aria-label="simple tabs example">
              <Tab className="appBar" label="Transfers" value="1" />
              <Tab label="" value="1"/>
            </TabList>
        }
    </AppBar>
      <TabPanel value="1">{(transferEvents.length > 0 ? <TransferTable transferList={transferList.reverse()} eventCount={transferList.length} matches={matches} tokenOwner={tokenOwner} accountId={accountId}/> : 'No Transfer Events')}</TabPanel>
      </TabContext>) 
  }
      
     
    

    </>
  )
}