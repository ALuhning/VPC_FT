import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Transfer from '../Transfer/transfer'
import TransferOwnership from '../TransferOwnership/transferOwnership'
import Mint from '../Mint/mint'
import Burn from '../Burn/burn'

// Material UI Components
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TransferWithinAStationTwoToneIcon from '@material-ui/icons/TransferWithinAStationTwoTone';
import LabelImportantIcon from '@material-ui/icons/LabelImportant';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import FireplaceIcon from '@material-ui/icons/Fireplace';


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  mintButton: {

  },
}));

export default function ActionSelector(props) {
  const classes = useStyles();
  const [transferClicked, setTransferClicked] = useState(false)
  const [ownershipClicked, setOwnershipClicked] = useState(false)
  const [mintClicked, setMintClicked] = useState(false)
  const [burnClicked, setBurnClicked] = useState(false)
  
  const { currentSupply, handleSupplyChange, handleOwnerChange } = props

  const handleTransferClick = () => {
    setTransferClicked(true)
  };

  const handleOwnershipClick = () => {
    setOwnershipClicked(true)
  };

  const handleMintClick = () => {
    setMintClicked(true)
  };

  const handleBurnClick = () => {
    setBurnClicked(true)
  };

  function handleMintClickState(property) {
    setMintClicked(property)
  }

  function handleBurnClickState(property) {
    setBurnClicked(property)
  }

  function handleTransferClickState(property) {
    setTransferClicked(property)
  }

  function handleTransferOwnershipClickState(property) {
    setOwnershipClicked(property)
  }

  return (
    <>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>Actions</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <List component="nav" aria-label="main mailbox folders">
          <ListItem button onClick={handleTransferClick}>
            <ListItemIcon><LabelImportantIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Transfer Tokens" />
          </ListItem>
          <ListItem button onClick={handleOwnershipClick}>
            <ListItemIcon><TransferWithinAStationTwoToneIcon color="secondary" /></ListItemIcon>
            <ListItemText primary="Transfer Ownership" />
          </ListItem>
          <ListItem button onClick={handleMintClick}>
            <ListItemIcon><AddCircleIcon color='action' /></ListItemIcon>
            <ListItemText primary="Mint Tokens" />
          </ListItem>
          <ListItem button onClick={handleBurnClick}>
            <ListItemIcon><FireplaceIcon color='secondary' /></ListItemIcon>
            <ListItemText primary="Burn Tokens" />
          </ListItem>
        </List>
        </AccordionDetails>
      </Accordion>

      {mintClicked ? <Mint currentSupply={currentSupply} handleMintClickState={handleMintClickState} handleSupplyChange={handleSupplyChange} /> : null }
      {burnClicked ? <Burn currentSupply={currentSupply} handleBurnClickState={handleBurnClickState} handleSupplyChange={handleSupplyChange} /> : null }
      {ownershipClicked ? <TransferOwnership handleTransferOwnershipClickState={handleTransferOwnershipClickState} handleOwnerChange={handleOwnerChange} /> : null }
      {transferClicked ? <Transfer handleTransferClickState={handleTransferClickState} /> : null }
    </>
  );
}