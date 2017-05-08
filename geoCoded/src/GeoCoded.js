import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import SelectField from 'material-ui/SelectField';
import Popover from 'material-ui/Popover';
import Divider from 'material-ui/Divider';
import {List, ListItem} from 'material-ui/List';
import Paper from 'material-ui/Paper';

/**
 * A simple example of `AppBar` with an icon on the right.
 * By default, the left icon is a navigation-menu.
 */


class AppBarExampleIcon extends Component {


render () {

  return (
    <div className="geoCodingResults">
      <div className="locationResult">
        <div className="locationIcon">
          <i className="fa fa-search"></i>
        </div>
        <div className="locationDetails">
          <span className="place">Lambert</span> 10701 Lambert International Blvd
        </div>
      </div>
      <div className="locationResult">
        <div className="locationIcon">
          <i className="fa fa-search"></i>
        </div>
        <div className="locationDetails">
          <span className="place">Lambert Int Airport</span> 10701 Lambert International Blvd, St. Louis, MO 63145
        </div>
      </div>
      <div className="locationResult">
        <div className="locationIcon">
          <i className="fa fa-fw"></i>
        </div>
        <div className="locationDetails">
          <span className="place">Lambert Int Airport</span> 10701 Lambert International Blvd, St. Louis, MO 63145
        </div>
      </div>
      <div className="locationResult">
        <div className="locationIcon">
          <i className="fa fa-search"></i>
        </div>
        <div className="locationDetails">
          <span className="place">Lambert Int Airport</span> 10701 Lambert International Blvd, St. Louis, MO 63145
        </div>
      </div>
      <div className="locationResult">
        <div className="locationIcon">
          <i className="fa fa-search"></i>
        </div>
        <div className="locationDetails">
          <span className="place">Lambert Int Airport</span> 10701 Lambert International Blvd, St. Louis, MO 63145
        </div>
      </div>
    </div>
  )};
}

export default AppBarExampleIcon;
