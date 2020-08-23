import React, { useState } from 'react'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import TablePagination from '@material-ui/core/TablePagination'

const useStyles = makeStyles({
  table: {
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

export default function OwnerTransferTable(props) {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const classes = useStyles()
    
    const { otList, eventCount, matches } = props

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <>
        
        <TableContainer component={Paper}>
            <Table className={classes.table} size="small" aria-label="a dense table">
                <TableHead>
                <TableRow>
                    <TableCell className={classes.cell}>BlockIndex</TableCell>
                    <TableCell className={classes.cell} align="right">Owner</TableCell>
                    <TableCell className={classes.cell} align="right">New Owner</TableCell>
                    <TableCell className={classes.cell} align="right">Id</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {(rowsPerPage > 0
                    ? otList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : otList
                ).map((row) => (
                    <TableRow key={row[0].id}>
                    <TableCell className={classes.cell} component="th" scope="row" size='small' align="left">
                        <div className={classes.cellText}>{row[0].date}</div>
                    </TableCell>
                    <TableCell className={classes.cell} align="right"><div className={classes.cellText}>{row[0].owner}</div></TableCell>
                    <TableCell className={classes.cell} align="right"><div className={classes.cellText}>{row[0].newOwner}</div></TableCell>
                    <TableCell className={classes.cell} align="right"><div className={classes.cellText}>{row[0].id}</div></TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
        <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={eventCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
        />
    </>
    )
}