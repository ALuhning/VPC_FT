import React, { useState } from 'react'
import LogoutButton from '../../components/common/LogoutButton/logoutButton'
import TransferOwnership from '../../components/TransferOwnership/transferOwnership'
import ActionSelector from '../ActionSelector/actionSelector'
import TransferList from '../TransferList/transferList'
import BalanceChart from '../BalanceGraphs/balanceGraph'

// Material UI imports
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Paper from '@material-ui/core/Paper'
import Chip from '@material-ui/core/Chip'
import AccountCircleTwoToneIcon from '@material-ui/icons/AccountCircleTwoTone'
import AccountBalanceWalletTwoToneIcon from '@material-ui/icons/AccountBalanceWalletTwoTone'
import Tooltip from '@material-ui/core/Tooltip'

const useStyles = makeStyles((theme) => ({
    root: {
      
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
    customCard: {
        maxWidth: 275,
        margin: 'auto',
        padding: 20
    },
  }));

export default function TokenData(props) {
    const [graphData, setGraphData] = useState([])

    const classes = useStyles()
    

    const { tokenName, 
      tokenSymbol, 
      precision, 
      initialSupply, 
      currentSupply,
      accountBalance, 
      tokenOwner, 
      accountId,
      transferEvents,
      mintEvents,
      burnEvents,
      ownerTransferEvents,
      tabValue,
      handleOwnerChange,
      handleTransferEventChange,
      handleTabValueState, 
      handleSupplyChange } = props

    let thisAccountBalance = 'Current Balance: ' + accountBalance

    return (
       
        <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
          <Grid container >
            
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <LogoutButton accountId={accountId} />
            </Grid>
           
          </Grid>
            <Typography variant="h5" component="h1" style={{marginTop: 20, marginBottom: 20}}>
                    {tokenName + '  '}<Chip color="primary" size="small" label={tokenSymbol} />
              </Typography>

            <Grid container direction="row" justify="space-evenly" style={{marginBottom:10, marginTop: 10}}>
                <Grid item xs={10} sm={6} md={4} lg={3} xl={3} >
                     <ActionSelector currentSupply={currentSupply} 
                        handleOwnerChange={handleOwnerChange} 
                        handleSupplyChange={handleSupplyChange} 
                        handleTransferEventChange={handleTransferEventChange}
                        handleTabValueState={handleTabValueState}
                        tokenOwner={tokenOwner}
                        accountId={accountId}
                        accountBalance={accountBalance}
                      /> 
                </Grid>
            </Grid>

            <Grid container>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Tooltip title="Account Balance" placement="right">
                  <Chip variant="outlined" label={thisAccountBalance} style={{marginBottom: 10}}/>
                </Tooltip>
              </Grid>
            </Grid>
        
            <Grid container>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <TransferList 
                  transferEvents={transferEvents} 
                  mintEvents={mintEvents}
                  burnEvents={burnEvents}
                  ownerTransferEvents={ownerTransferEvents}
                  tokenOwner={tokenOwner} 
                  accountId={accountId} 
                  initialSupply={initialSupply} 
                  accountBalance={accountBalance}
                  handleTabValueState={handleTabValueState}
                  tabValue={tabValue}
                />
              </Grid>
            </Grid>
              
     
      <Divider style={{marginBottom: 10}}/>

       <Grid container className={classes.root} spacing={1}>
        <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
          <Typography variant="button" display="block">Total Supply</Typography>
         
            <Chip variant="outlined" icon={<AccountBalanceWalletTwoToneIcon />} label={currentSupply} style={{marginRight: 5}}/>
    
        </Grid>

        <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
         <Typography variant="button" display="block">Token Owner</Typography>
         
           <Chip variant="outlined" icon={<AccountCircleTwoToneIcon />} label={tokenOwner} />
 
        </Grid>
      </Grid>

     </Paper>
     </Grid>
   </Grid>
      
    )
    
}