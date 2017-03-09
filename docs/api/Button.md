`Button` (component)
====================

Button with built-in tooltip.

```xml
<Button buttonType='Flat' label='Close' tooltip='Close dialog' onTouchTap={this.close.bind(this)} />
```

Properties
----------

### `backgroundColor`

Background color.

type: `string`


### `buttonStyle`

Style config object for the wrapping span element.

type: `object`


### `buttonType`

Type of button.

type: `enum ('Raised'|'Flat'|'Action'|'Icon')`
defaultValue: `'Raised'`



### `className`

Css class name to apply on the span.

type: `string`


### `disabled`

Should this button be disabled?

type: `bool`


### `icon`

Optional icon.

type: `node`


### `iconStyle`

Icon style config object.

type: `object`


### `label`

Label to show on the button.

type: `string`


### `mini`

Should this button be mini? Only applies to certain button types.

type: `bool`


### `onTouchTap`

Function to execute when the button is clicked.

type: `func`


### `primary`

Should we use the primary state?

type: `bool`


### `secondary`

Should we use the secondary state?

type: `bool`


### `style`

Style config object for the button.

type: `object`


### `tooltip`

The tooltip to show for this button.

type: `string`


### `tooltipPosition`

Position of the tooltip.

type: `enum ('bottom'|'bottom-right'|'bottom-left'|'right'|'left'|'top-right'|'top'|'top-left')`
defaultValue: `'bottom'`

