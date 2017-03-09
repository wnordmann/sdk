`PointSymbolizerEditor` (component)
===================================

Style editor for a point symbolizer. Can edit symbol type, stroke and fill. Is used by the Rule Editor.

```xml
<PointSymbolizerEditor onChange={this.props.onChange} initialState={this.props.initialState} />
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `initialState`

Initial state for the point symbolizer.

type: `object`



### `onChange` (required)

Callback that is called when a change is made.

type: `func`

