`MapPanel` (component)
======================

A div that can render the OpenLayers map object. It will also take care of notifying the user of load errors.
It can also provide integration with the browser's back and forward button for extent history navigation.

```xml
<MapPanel id='map' map={map} />
```

Properties
----------


### `className`

Css class name to apply on the map div.

type: `string`


### `extent`

Extent to fit on the map initially.

type: `arrayOf number`


### `id`

Identifier of the map div.

type: `string`



### `map` (required)

The map to use for this map panel.

type: `instanceOf ol.Map`


### `useHistory`

Use the back and forward buttons of the browser for navigation history.

type: `bool`
defaultValue: `true`

