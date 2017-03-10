`Globe` (component)
===================

Adds a button to toggle 3D mode.
The HTML page of the application needs to include a script tag to cesium:

```html
<script src="./resources/ol3-cesium/Cesium.js" type="text/javascript" charset="utf-8"></script>
```

```xml
<Globe map={map} />
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `hideScalebar`

Resolution at which to hide the scalebar in 3D mode

type: `number`
defaultValue: `78271`



### `map` (required)

The ol3 map instance to work on.

type: `instanceOf ol.Map`


### `style`

Style for the button.

type: `object`


### `tooltipPosition`

Position of the tooltip.

type: `enum ('bottom'|'bottom-right'|'bottom-left'|'right'|'left'|'top-right'|'top'|'top-left')`

