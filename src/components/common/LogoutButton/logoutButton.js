import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { logout } from '../../../utils'

// Material UI components
import Button from '@material-ui/core/Button'
import LockTwoToneIcon from '@material-ui/icons/LockTwoTone';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(0),
    float: 'right',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0
  },
  accountButton: {
    margin: theme.spacing(0),
    float: 'right',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  }));

export default function LogoutButton(props) {

    const classes = useStyles()
    const { accountId } = props

    return (
        <>
            <Button
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<LockTwoToneIcon />}
            onClick={logout}
            >Sign Out</Button>
            <Button variant="outlined" color="primary" className={classes.accountButton} onClick={logout}>
                {accountId}
            </Button>
      </>
    )
}