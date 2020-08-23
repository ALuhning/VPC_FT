import React, { useMemo, useCallback } from 'react'
import { Chart } from 'react-charts'

// Material UI Components
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    root: {
      minHeight: 200,
      marginBottom: 20
    },
  }));
 
export default function BalanceChart(props) {
    const classes = useStyles()
    const { graphData } = props
    console.log('graphData', graphData)
  const data = useMemo(
    () => [
      {
        label: 'Balance',
        data: graphData
      }
    ],
    []
  )

  const series = useMemo(
    () => ({
      type: 'area',
    }),
    []
  )
 
  const axes = useMemo(
    () => [
      { primary: true, type: 'linear', position: 'bottom', show: false },
      { type: 'linear', position: 'left' }
    ],
    []
  )

  const getSeriesStyle = useCallback(
    () => ({
      transition: 'all .5s ease'
    }),
    []
  )

  const getDatumStyle = useCallback(
    () => ({
      transition: 'all .5s ease'
    }),
    []
  )
 


  return (<Grid container className={classes.root}>
    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
      <Chart data={data} axes={axes} series={series} getSeriesStyle={getSeriesStyle} getDatumStyle={getDatumStyle} tooltip/>
      </Grid>
      
  </Grid>)
}