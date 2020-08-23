import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import InputAdornment from '@material-ui/core/InputAdornment'


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 'auto',
    marginTop: 50,
    minHeight: 550
  },
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  }));

 

export default function Burn(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)

  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()
  const { currentSupply, handleBurnClickState, handleSupplyChange } = props

  const handleClose = () => {
    handleBurnClickState(false)
    setOpen(false)
  }

  const onSubmit = async (values) => {
    event.preventDefault()
    const { amount } = values
    setFinished(false)
    
    let finished = await window.contract.burn({
                        tokens: amount
                    }, process.env.DEFAULT_GAS_VALUE)
                    
    let changed = await handleSupplyChange()

    if(finished && changed) {
      setFinished(true)
      setOpen(false)
      handleBurnClickState(false)
    }
}

  return (
    <div>
     
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Burn Tokens</DialogTitle>
        <DialogContent>
        {!finished ? <LinearProgress className={classes.progress} /> : (
          <DialogContentText style={{marginBottom: 10}}>
          There are currently <b>{currentSupply}</b> tokens in existence.
          Enter the number of tokens you want to burn.
          </DialogContentText>)}
          
          <TextField
            autoFocus
            margin="dense"
            id="amount"
            variant="outlined"
            name="amount"
            label="Amount"
            placeholder="e.g. 1000000000"
            inputRef={register({
                required: true, 
                validate: value => value >= 0 || <p style={{color: 'red'}}>Burn amount must be greater than zero.</p>
            })}
            InputProps={{
                endAdornment: <InputAdornment position="end">Tokens</InputAdornment>,
                }}
            />
            {errors.amount?.message}

        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">
            Burn Tokens
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
