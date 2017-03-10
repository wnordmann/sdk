`GeocodingResults` (component)
==============================

This component displays the results of geocoding search. The geocoding search is initiated by the Geocoding component.

```xml
<GeocodingResults map={map} />
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`



### `map` (required)

The ol3 map on whose view to perform the center action.

type: `instanceOf ol.Map`


### `markerUrl`

Url to the marker image to use for bookmark position.

type: `string`
defaultValue: `'./resources/marker.png'`


### `zoom`

The zoom level used when centering the view on a geocoding result.

type: `number`
defaultValue: `10`

