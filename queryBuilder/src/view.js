import React from 'react';
import ReactDOM from 'react-dom';
import lightTheme from './lightTheme.js';
import './main.scss';
import 'font-awesome-webpack';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconButton from 'material-ui/IconButton';
import NavigationMoreVert from 'material-ui/svg-icons/navigation/more-vert';
import QueryBuilder from './QueryBuilder.js';
import QueryBuilderAdd from './QueryBuilderAdd.js';
import AppBar from 'material-ui/AppBar';

export default class DrawerSimpleExample extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };



//Duplication .DrawerUnit
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightTheme)}>
        <div>

        <AppBar
          title="Quickview Application"
          iconElementRight={
            <div className="headerIcons">
              <IconButton
                 iconClassName="headerIcons ms ms-filter"
                 onTouchTap={this.handleTouchTap}
                />
              <Popover
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onRequestClose={this.handleRequestClose}
              >
              <div>
                <QueryBuilderAdd />
              </div>
              </Popover>
              <IconButton
                 iconClassName="headerIcons ms ms-select-box"
                />
              <IconButton
                 iconClassName="headerIcons ms ms-measure-distance"
                />
              <IconButton>
                <NavigationMoreVert />
              </IconButton>
            </div>}
        />
        <AppBar
          title="Quickview Application"
          iconElementRight={
          <div className="headerIcons">
            <IconButton
               iconClassName="headerIcons ms ms-filter"
               onTouchTap={this.handleTouchTap}
              />
            <Popover
              open={this.state.open}
              anchorEl={this.state.anchorEl}
              anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
              targetOrigin={{horizontal: 'left', vertical: 'top'}}
              onRequestClose={this.handleRequestClose}
            >
            <div>
              <QueryBuilder />
            </div>
            </Popover>
            <IconButton
               iconClassName="headerIcons ms ms-select-box"
              />
            <IconButton
               iconClassName="headerIcons ms ms-measure-distance"
              />
            <IconButton>
              <NavigationMoreVert />
            </IconButton>
          </div>}
        />
    </div>
      </ MuiThemeProvider>
    );
  }
}
