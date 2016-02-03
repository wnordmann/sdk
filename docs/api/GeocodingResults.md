`GeocodingResults` (component)
==============================

This component displays the results of geocoding search. The geocoding search is initiated by the Geocoding component.

Props
-----

### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map on whose view to perform the center action.

type: `instanceOfol.Map`


### `markerUrl`

Url to the marker image to use for bookmark position.

type: `string`
defaultValue: `'./resources/marker.png'`


### `zoom`

The zoom level used when centering the view on a geocoding result.

type: `number`
defaultValue: `10`

