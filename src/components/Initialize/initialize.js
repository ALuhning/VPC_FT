import React, { useState, useEffect } from 'react'
import { Redirect } from 'react-dom'
import { makeStyles } from '@material-ui/core/styles'
import { useForm } from 'react-hook-form'
import LogoutButton from '../../components/common/LogoutButton/logoutButton'

// Material UI components
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import LinearProgress from '@material-ui/core/LinearProgress'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Card from '@material-ui/core/Card'


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 'auto',
    marginTop: 50,
    minHeight: 550
    
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  customCard: {
    maxWidth: 300,
    minWidth: 275,
    margin: 'auto',
    padding: 20
  },
  rootForm: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  }));


export default function Initialize(props) {

    const classes = useStyles()
    const { register, handleSubmit, watch, errors } = useForm()
    const { done, handleInitChange, initialized, accountId } = props
    
    const [finished, setFinish] = useState(true)

    useEffect(
      () => {
          async function fetchInit () {
            try {
            let init = await window.contract.getInit()
            init=='done' ? handleInitChange(true) : handleInitChange(false)
            } catch (err) {
              console.log('failure fetching init')
            }
          }
          if(finished) {
            fetchInit().then((res) => {
              console.log(res)
            })
          }
      }, [initialized, finished])

  
    const onSubmit = async (values) => {
        event.preventDefault()
        setFinish(false)
        const { tokenName, tokenSymbol, precision, initialSupply } = values
        console.log('values', values)
     
        let finished = await window.contract.init({
                            name: tokenName,
                            symbol: tokenSymbol,
                            precision: precision,
                            initialSupply: initialSupply
                        }, process.env.DEFAULT_GAS_VALUE)
        setFinish(finished)
    }

    if(!done || !finished) {
      return <LinearProgress className="progress"/>
    } else if (!initialized) {
      return (       
        <Grid container spacing={3}>
         <Grid item xs={12}>
           <Paper className={classes.paper}>
            <LogoutButton accountId={accountId} />
               <div className={classes.root}>
                 <Card className={classes.customCard}>
                  <Typography variant="h5" component="h1" >Fungible Token Creator</Typography>
                  <form className={classes.rootForm} noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>

                    <TextField
                      id="token-name"
                      variant="outlined"
                      name="tokenName"
                      label="Token Name"
                      inputRef={register({
                          required: true,
                      })}
                      placeholder="e.g. Vital Point Coin"
                    />
                      
                    <TextField
                      id="token-symbol"
                      variant="outlined"
                      name="tokenSymbol"
                      label="Token Symbol"
                      required={true}
                      inputRef={register({
                          required: true
                      })}
                      placeholder="e.g. VPC"
                    />

                    <TextField
                      id="token-precision"
                      variant="outlined"
                      name="precision"
                      label="Precision"
                      placeholder="18"
                      inputRef={register({
                          required: true,
                      })}
                      InputProps={{
                          endAdornment: <InputAdornment position="end">Decimals</InputAdornment>,
                      }}
                    />

                    <TextField
                    id="token-supply"
                    variant="outlined"
                    name="initialSupply"
                    label="Initial Supply"
                    placeholder="e.g. 1000000000"
                    inputRef={register({
                        required: true, 
                    })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">Tokens</InputAdornment>,
                      }}
                    />

                  <Button variant="contained" color="primary" type="submit">
                        Submit
                  </Button>

                  <Button variant="contained" color="secondary" type="reset">
                        Reset
                  </Button>

                  </form>
                  </Card>
                </div>
            </Paper>
          </Grid>
        </Grid> 
    )
  } else {
    return (<Redirect to="/"/>)
  }
}