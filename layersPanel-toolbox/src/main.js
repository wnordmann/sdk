import React from 'react';
import {render} from 'react-dom';
import 'react-toolbox/lib/commons.scss';
import './main.scss';
import View from './view.js';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

render(<View/>, document.querySelector('#app'));
