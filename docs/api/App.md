`App` (component)
=================

Base class for applications. Can handle using the browser history to navigate through map extents.
An initial extent can be provided as well.

```javascript

import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import {IntlProvider} from 'react-intl';
import App from '.boundless-sdk/js/components/App.js';
import enMessages from 'boundless-sdk/locale/en.js';

class MyApp extends App {
  componentDidMount() {
    super.componentDidMount();
    // your code here
  }
  render() {
    // we need to provide a reference to the map
    return (
      <div id='map' ref='map'></div>
    );
  }
}

var extent = [1327331, 4525032, 5123499, 5503426];
ReactDOM.render(<IntlProvider locale='en' messages={enMessages}><MyApp extent={extent} useHistory={false} map={map} /></IntlProvider>, document.getElementById('main'));
```

Properties
----------

### `extent`

Extent to fit on the map on loading of the application.

type: `arrayOf number`


### `map` (required)

The map to use for this application.

type: `instanceOf ol.Map`


### `useHistory`

Use the back and forward buttons of the browser for navigation history.

type: `bool`
defaultValue: `true`

