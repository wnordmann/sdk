`Edit` (component)
==================

A component that allows creating new features, so drawing their geometries and setting feature attributes through a form.

```xml
<Edit toggleGroup='navigation' map={map} />
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`



### `map` (required)

The map onto which to activate and deactivate the interactions.

type: `instanceOf ol.Map`


### `pointRadius`

The point radius used for the circle style.

type: `number`
defaultValue: `7`


### `strokeWidth`

The stroke width in pixels used in the style for the created features.

type: `number`
defaultValue: `2`


### `style`

Style config for root div.

type: `object`
defaultValue: `{
  padding: 10
}`


### `toggleGroup`

The toggleGroup to use. When this tool is activated, all other tools in the same toggleGroup will be deactivated.

type: `string`


### `toolId`

Identifier to use for this tool. Can be used to group tools together.

type: `string`

