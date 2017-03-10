`FilterEditor` (component)
==========================

Editor for a single filter. Used by the RuleEditor.

```xml
<FilterEditor onChange={this._onChange.bind(this)} initialExpression={expression} />
```

Properties
----------

### `attributes` (required)

List of attributes.

type: `array`


### `className`

Css class name to apply on the root element of this component.

type: `string`


### `initialExpression`

Initial expression.

type: `array`
defaultValue: `null`



### `onChange` (required)

Callback that is called when a change is made.

type: `func`

