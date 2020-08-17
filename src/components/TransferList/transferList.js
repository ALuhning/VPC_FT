import React from 'react'

// Material UI Components
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  table: {
   // minWidth: 650,
  },
  cell: {
      paddingTop: 6,
      paddingBottom: 6,
      paddingLeft: 5,
      paddingRight: 0,
      maxWidth: 70,
  },
  cellText: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      width: '100%'
  }
});

export default function TransferList(props) {
    console.log('transferlist props', props)
  const classes = useStyles()
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.only('xs'))
  const { transferEvents } = props
  
  let transferList = []
 
  if (transferEvents.length > 0) {
        transferEvents.map(transfer => {
            console.log('transfer in map', transfer)
            transferList.push([{id: transfer.id, spender: transfer.spender, from: transfer.from, to: transfer.to, value: transfer.value, date: transfer.date}])
            console.log('transferList', transferList)
            console.log('matches', matches)
        })
    }

if(transferEvents.length > 0 && matches ) {
  return (<>
      <Typography variant="h6" component="h6" align="left">Transfers ({transferEvents.length})</Typography>
    <TableContainer component={Paper}>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell className={classes.cell}>BlockIndex</TableCell>
            <TableCell className={classes.cell} align="right">From</TableCell>
            <TableCell className={classes.cell} align="right">To</TableCell>
            <TableCell className={classes.cell} align="right">Tokens</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transferList.map((row) => (
            <TableRow key={row[0].id}>
              <TableCell className={classes.cell} component="th" scope="row" size='small' align="left">
                <div className={classes.cellText}>{row[0].date}</div>
              </TableCell>
              <TableCell className={classes.cell} align="right"><div className={classes.cellText}>{row[0].from}</div></TableCell>
              <TableCell className={classes.cell} align="right"><div className={classes.cellText}>{row[0].to}</div></TableCell>
              <TableCell className={classes.cell} align="right"><div className={classes.cellText}>{row[0].value}</div></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer></>
  )
} else if(transferEvents.length > 0 && !matches ) {
    return(<>
    <Typography variant="h6" component="h6" align="left">Transfers</Typography>
    <TableContainer component={Paper}>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell className={classes.cell}>BlockIndex</TableCell>
            <TableCell className={classes.cell} align="right">Spender</TableCell>
            <TableCell className={classes.cell} align="right">From</TableCell>
            <TableCell className={classes.cell} align="right">To</TableCell>
            <TableCell className={classes.cell} align="right">Tokens</TableCell>
            <TableCell className={classes.cell} align="right">Id</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transferList.map((row) => (
            <TableRow key={row[0].id}>
              <TableCell className={classes.cell} component="th" scope="row" size='small' align="left">
                <div className={classes.cellText}>{row[0].date}</div>
              </TableCell>
              <TableCell className={classes.cell} align="right"><div className={classes.cellText}>{row[0].spender}</div></TableCell>
              <TableCell className={classes.cell} align="right"><div className={classes.cellText}>{row[0].from}</div></TableCell>
              <TableCell className={classes.cell} align="right"><div className={classes.cellText}>{row[0].to}</div></TableCell>
              <TableCell className={classes.cell} align="right"><div className={classes.cellText}>{row[0].value}</div></TableCell>
              <TableCell className={classes.cell} align="right"><div className={classes.cellText}>{row[0].id}</div></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer></>
    )
} else {
    return <div>No Transfers Yet</div>
    }
}