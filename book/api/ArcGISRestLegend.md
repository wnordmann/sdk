`ArcGISRestLegend` (component)
==============================

Legend component for layers with an ArcGISRest source (tiled or untiled).

```xml
<ArcGISRestLegend className='legend-list-img' layer={layer} />
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `layer` (required)

The layer that has a WMS source.

type: `instanceOf ol.layer.Layer`


### `style`

Style config.

type: `object`

