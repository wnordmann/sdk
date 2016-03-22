`Bookmarks` (component)
=======================

Adds the ability to retrieve spatial bookmarks.
A spatial bookmark consists of a name, an extent and a description.

Props
-----

### `animatePanZoom`

Should we animate the pan and zoom operation?

type: `bool`
defaultValue: `true`


### `animationDuration`

The duration of the animation in milleseconds. Only relevant if animatePanZoom is true.

type: `number`
defaultValue: `500`


### `autoplay`

Should the scroller auto scroll?

type: `bool`
defaultValue: `false`


### `autoplaySpeed`

delay between each auto scoll in ms.

type: `number`


### `bookmarks` (required)

The bookmark data. An array of objects with name, description and extent keys.
The extent should be in the view projection.

type: `arrayOf shape`


### `dots`

Should we show indicators? These are dots to navigate the bookmark pages.

type: `bool`
defaultValue: `true`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `introDescription`

The description of the introduction (first) page of the bookmarks.

type: `string`
defaultValue: `''`


### `introTitle`

The title on the introduction (first) page of the bookmarks.

type: `string`
defaultValue: `''`


### `map` (required)

The ol3 map instance on whose view we should navigate.

type: `instanceOf ol.Map`


### `markerUrl`

Url to the marker image to use for bookmark position.

type: `string`
defaultValue: `'./resources/marker.png'`


### `menu`

Display as a menu drop down list.

type: `bool`
defaultValue: `false`


### `showMarker`

Should we display a marker for the bookmark? Default is true.

type: `bool`
defaultValue: `true`

