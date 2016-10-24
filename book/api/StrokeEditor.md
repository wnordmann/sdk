`StrokeEditor` (component)
==========================

Style editor for stroke properties (color and width).

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `initialStrokeColor`

Initial stroke color.

type: `object`
defaultValue: `{
  rgb: {
    r: 0,
    g: 0,
    b: 0,
    a: 1
  },
  hex: '#000000'
}`


### `initialStrokeWidth`

Initial stroke width.

type: `number`
defaultValue: `1`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `onChange` (required)

Callback that is called when a change is made.

type: `func`

