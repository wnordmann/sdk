import React from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';

/**
 * A simple example of `AppBar` with an icon on the right.
 * By default, the left icon is a navigation-menu.
 */

const AppBarExampleIcon = () => (
  <AppBar
    title="Edit: Spearfish archeological sites"
    // iconClassNameRight="muidocs-icon-navigation-expand-more"
    iconElementRight={<FlatButton label="Add" />}
  />
);

export default AppBarExampleIcon;
