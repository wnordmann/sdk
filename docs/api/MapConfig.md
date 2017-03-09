`MapConfig` (component)
=======================

Export the map configuration and ability to reload it from local storage.

```xml
<MapConfig map={map} />
```

![MapConfig](../MapConfig.png)

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `firstChild`

Are we the first child of the toolbar?

type: `bool`



### `lastChild`

Are we the last child of the toolbar?

type: `bool`


### `map` (required)

The ol3 map to save the layers from.

type: `instanceOf ol.Map`

