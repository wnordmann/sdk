`Zoom` (component)
==================

Two buttons to zoom in and out.

```xml
<Zoom map={map} />
```

![Zoom](../Zoom.png)

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `delta`

The zoom delta applied on each click.

type: `number`
defaultValue: `1`


### `duration`

Animation duration in milliseconds.

type: `number`
defaultValue: `250`



### `map` (required)

The ol3 map to use for zooming.

type: `instanceOf ol.Map`


### `style`

Style for the buttons.

type: `object`


### `tooltipPosition`

Position of the tooltip.

type: `enum ('bottom'|'bottom-right'|'bottom-left'|'right'|'left'|'top-right'|'top'|'top-left')`


### `zoomInTipLabel`

Tooltip to show for zoom in button.

type: `string`


### `zoomOutTipLabel`

Tooltip to show for zoom out button.

type: `string`

