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
import NavMenu from './NavMenu.js';

// require('./mapskin/fonts/mapskin.css');

export default class DrawerSimpleExample extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    handleToggle = () => this.setState({
        open: !this.state.open
    });

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(lightTheme)}>
                <div>
                    <RaisedButton className="matButton" label="Toggle Drawer" onTouchTap={this.handleToggle}/>
                    <Drawer width={360} open={this.state.open}>
                        <AppBar/>
                        <NavMenu/>
                    </Drawer>
                </div>
            </ MuiThemeProvider>
        );
    }
}
