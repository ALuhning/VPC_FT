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

 

export default function TransferOwnership(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)

  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()
  const { handleOwnerChange, handleTransferOwnershipClickState, accountId } = props

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleTransferOwnershipClickState(false)
    setOpen(false)
  };

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)
    const { newOwner } = values
    console.log('values', values)
 
    let finished = await window.contract.transferOwnership({
                        newOwner: newOwner
                    }, process.env.DEFAULT_GAS_VALUE)
    let changed = await handleOwnerChange(newOwner)
    if(finished && changed) {
      setFinished(true)
      setOpen(false)
      handleTransferOwnershipClickState(false)
    }
}

  return (
    <div>
     
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Transfer Token Ownership</DialogTitle>
        <DialogContent>
        {!finished ? <LinearProgress className={classes.progress} /> : (
          <DialogContentText style={{marginBottom: 20}}>
            This will <b>permanently transfer</b> ownership of this token to another account.  
            If you do not own the account you are transferring ownership to, you will 
            lose ownership access to this token.
          </DialogContentText>)}
          
          <TextField
            autoFocus
            margin="dense"
            id="newOwner"
            variant="outlined"
            name="newOwner"
            label="New Owner Account Id"
            inputRef={register({
                required: true,
                validate: value => value != accountId || <p style={{color:'red'}}>Can not transfer ownership to yourself, please enter a new account.</p>
            })}
            placeholder="e.g. newOwner.testnet"
            fullWidth
          />
          {errors.newOwner?.message}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">
            Transfer Ownership
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
