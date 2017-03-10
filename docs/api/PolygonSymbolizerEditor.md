`PolygonSymbolizerEditor` (component)
=====================================

Style editor for a polygon symbolizer. Currently limited to fill and stroke. Used by the Rule Editor.

```xml
<PolygonSymbolizerEditor onChange={this.props.onChange} initialState={this.props.initialState} />
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `initialState`

Initial state for the polygon symbolizer.

type: `object`


### `onChange` (required)

Callback that is called when a change is made.

type: `func`

