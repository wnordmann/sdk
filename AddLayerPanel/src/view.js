import React from 'react';
import ReactDOM from 'react-dom';
import lightTheme from './lightTheme.js';
import './main.scss';
import 'font-awesome-webpack';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from './appbar.js';
import AddLayer from './AddLayer.js';
import LayerList from './LayerList.js';
import AppBarNewLayer from './AppBarNewLayer.js';
import AddLayerExisting from './AddLayerExisting.js';
import AddLayerSelectSource from './AddLayerSelectSource.js';
import AddLayerNewServer from './AddLayerNewServer.js';

// require('./mapskin/fonts/mapskin.css');

export default class DrawerSimpleExample extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            openA: false,
            openB: false,
            openC: false,
            openD: false,
            openE: false
            //addMore here
                    };
    }
    closeDrawers = () => this.setState({
      openA: false,
      openB: false,
      openC: false,
      openD: false,
      openE: false
      //mirror constructor
    })
    //Duplicate this function
    handleToggleA = () => {
      this.closeDrawers();
      this.setState({
        openA: !this.state.openA
      })
    };
    handleToggleB = () => {
      this.closeDrawers();
      this.setState({
        openB: !this.state.openB
      })
    };
    handleToggleC = () => {
      this.closeDrawers();
      this.setState({
        openC: !this.state.openC
      })
    };
    handleToggleD = () => {
      this.closeDrawers();
      this.setState({
        openD: !this.state.openD
      })
    };
    handleToggleE = () => {
      this.closeDrawers();
      this.setState({
        openE: !this.state.openE
      })
    };

//Duplication .DrawerUnit
    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(lightTheme)}>
                <div>
                    <div className='DrawerUnit'>
                      <RaisedButton className="matButton" label="Layers List" onTouchTap={this.handleToggleA}/>
                      <Drawer width={360} open={this.state.openA}>
                          <AppBar/>
                          <LayerList/>
                      </Drawer>
                    </div>
                    <div className='DrawerUnit'>
                      <RaisedButton className="matButton" label="Add new Start - Select Source" onTouchTap={this.handleToggleD}/>
                      <Drawer width={360} open={this.state.openD}>
                        <AppBarNewLayer />
                        <AddLayerSelectSource />
                      </Drawer>
                    </div>
                    <div className='DrawerUnit'>
                      <RaisedButton className="matButton" label="Add from Local Layer" onTouchTap={this.handleToggleB}/>
                      <Drawer width={360} open={this.state.openB}>
                        <AppBarNewLayer />
                        <AddLayer/>
                      </Drawer>
                    </div>
                    <div className='DrawerUnit'>
                      <RaisedButton className="matButton" label="Add from existing GeoServer" onTouchTap={this.handleToggleC}/>
                      <Drawer width={360} open={this.state.openC}>
                        <AppBarNewLayer />
                        <AddLayerExisting />
                      </Drawer>
                    </div>
                    <div className='DrawerUnit'>
                      <RaisedButton className="matButton" label="Add from new GeoServer" onTouchTap={this.handleToggleE}/>
                      <Drawer width={360} open={this.state.openE}>
                        <AppBarNewLayer />
                        <AddLayerNewServer />
                      </Drawer>
                    </div>

                </div>
            </ MuiThemeProvider>
        );
    }
}
