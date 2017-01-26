import React from 'react';
import {render} from 'react-dom';
import lightTheme from './lightTheme.js';
import View from './view.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

render(<View/>, document.querySelector('#app'));
