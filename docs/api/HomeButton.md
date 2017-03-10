`HomeButton` (component)
========================

A button to go back to the initial extent of the map.

```xml
<HomeButton map={map} />
```

![Home Button](../HomeButton.png)

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `extent`

Extent to fit on the map on pressing this button. If not set, the initial extent of the map will be used.

type: `arrayOf number`



### `map` (required)

The ol3 map for whose view the initial center and zoom should be restored.

type: `instanceOf ol.Map`


### `style`

Style for the button.

type: `object`


### `tooltipPosition`

Position of the tooltip.

type: `enum ('bottom'|'bottom-right'|'bottom-left'|'right'|'left'|'top-right'|'top'|'top-left')`

