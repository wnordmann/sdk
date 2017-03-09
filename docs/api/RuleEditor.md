`RuleEditor` (component)
========================

Editor for a style rule. This means editing symbolizer properties and filter. Used by the Style Modal.

```xml
<RuleEditor geometryType={this.state.geometryType} initialState={symbol} onChange={this._onChange.bind(this)} attributes={this.state.attributes} />
```

Properties
----------

### `attributes`

List of attributes.

type: `array`


### `className`

Css class name to apply on the root element of this component.

type: `string`


### `geometryType`

The geometry type.

type: `enum ('Polygon'|'LineString'|'Point')`


### `initialState`

Initial state.

type: `object`



### `onChange` (required)

Callback that is called when a change is made.

type: `func`

