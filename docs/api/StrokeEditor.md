`StrokeEditor` (component)
==========================

Style editor for stroke properties (color and width).

```xml
<StrokeEditor onChange={this.props.onChange} initialStrokeColor={this.props.initialState.strokeColor} initialStrokeWidth={5} />
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `initialHasStroke`

Initial value for hasStroke.

type: `bool`
defaultValue: `true`


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



### `onChange` (required)

Callback that is called when a change is made.

type: `func`

