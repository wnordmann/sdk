`LabelModal` (component)
========================

A modal window for applying labels to a vector layer. Only works for local vector layers currently.

```xml
<LabelModal layer={this.props.layer} />
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`



### `layer` (required)

The layer associated with the style modal.

type: `instanceOf ol.layer.Vector`

