import React from 'react'
import LogoutButton from '../../components/common/LogoutButton/logoutButton'

// Material UI imports
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles((theme) => ({
    root: {
      minWidth: 275,
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
        minWidth: 275,
        margin: 'auto',
        padding: 20
    },
  }));

export default function TokenData(props) {
    const classes = useStyles();

    const { tokenName, tokenSymbol, precision, initialSupply, currentSupply, tokenOwner, accountId } = props
    
    return (
       
        <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
          <LogoutButton accountId={accountId} />    
            <Typography variant="h5" component="h1" style={{marginTop: 70, marginBottom: 20}}>
                    {tokenName}
              </Typography>
            <Grid container className={classes.root} spacing={2}>
        
            <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
            
            <Card className={classes.customCard} variant="outlined">
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Symbol
                </Typography>
                <Typography variant="h5" component="h2">
                    {tokenSymbol}
              </Typography>
            </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
            <Card className={classes.customCard} variant="outlined">
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Current Supply
                </Typography>
                <Typography variant="h5" component="h2">
                    {currentSupply}
              </Typography>
        </Card>
        
        </Grid>
        <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
        <Card className={classes.customCard} variant="outlined">
            <Typography className={classes.title} color="textSecondary" gutterBottom>
                Owner
            </Typography>
            <Typography variant="h5" component="h2">
                {tokenOwner}
          </Typography>
        </Card>
        
        </Grid>
        
        </Grid>
        <Divider variant="middle" style={{marginTop: 30, marginBottom: 30}}/>
        </Paper>
         </Grid>
       </Grid>
      
    )
    
}