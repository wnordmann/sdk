`FillEditor` (component)
========================

Style editor for fill color.

```xml
<FillEditor onChange={this._onChange.bind(this)} initialFillColor={{rgb: {r: 0, g: 255, b: 0, a: 0.5}, hex: '#00FF00'}}/>
```

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
  hex: '#FF0000'
}`


### `initialHasFill`

Initial value for hasFill.

type: `bool`
defaultValue: `true`



### `onChange` (required)

Callback that is called when a change is made.

type: `func`

