`LabelEditor` (component)
=========================

Editor for label properties. Can edit the label attribute, fontSize and fontColor.

Properties
----------

### `attributes` (required)

List of attributes.

type: `array`


### `className`

Css class name to apply on the root element of this component.

type: `string`


### `initialFontColor`

Initial font color.

type: `object`
defaultValue: `{
  rgb: {
    r: 0,
    g: 0,
    b: 0,
    a: 1
  },
  hex: '000000'
}`


### `initialFontSize`

Initial font size.

type: `number`
defaultValue: `12`


### `initialLabelAttribute`

Initial label attribute.

type: `string`
defaultValue: `null`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `onChange` (required)

Callback that is called when a change is made.

type: `func`

