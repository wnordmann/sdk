`FillEditor` (component)
========================

Style editor for fill color.

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `initialFillColor`

Initial fill color.

type: `object`
defaultValue: `{
  rgb: {
    r: 255,
    g: 0,
    b: 0,
    a: 0.5
  },
  hex: 'FF0000'
}`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `onChange` (required)

Callback that is called when a change is made.

type: `func`

