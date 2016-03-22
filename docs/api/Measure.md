`Measure` (component)
=====================

Adds area and length measure tools as a menu button.

```xml
<Measure toggleGroup='navigation' map={map}/>
```

Properties
----------

### `geodesic`

Should measurements be geodesic?

type: `bool`
defaultValue: `true`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The map onto which to activate and deactivate the interactions.

type: `instanceOf ol.Map`


### `toggleGroup`

The toggleGroup to use. When this tool is activated, all other tools in the same toggleGroup will be deactivated.

type: `string`

