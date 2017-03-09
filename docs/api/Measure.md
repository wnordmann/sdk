`Measure` (component)
=====================

Adds area and length measure tools as a menu button.

```xml
<Measure toggleGroup='navigation' map={map}/>
```

![Measure](../Measure.png)
![MeasureOpen](../MeasureOpen.png)

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `geodesic`

Should measurements be geodesic?

type: `bool`
defaultValue: `true`



### `map` (required)

The map onto which to activate and deactivate the interactions.

type: `instanceOf ol.Map`


### `toggleGroup`

The toggleGroup to use. When this tool is activated, all other tools in the same toggleGroup will be deactivated.

type: `string`


### `toolId`

Identifier to use for this tool. Can be used to group tools together.

type: `string`

