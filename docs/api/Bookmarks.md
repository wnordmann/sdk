`Bookmarks` (component)
=======================

Adds the ability to retrieve spatial bookmarks.
A spatial bookmark consists of a name, an extent and a description. Extent needs to be in the view projection.

```xml
<Bookmarks introTitle='Paris bakeries' introDescription='Explore the best bakeries of the capital of France' map={map} bookmarks={[{name: 'foo1', description: 'description1', extent: [259562, 6254560, 260675, 6256252]}, {name: 'foo2', description: 'description2', extent: [258703, 6248811, 259816, 6250503]}]} />
```

Properties
----------

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


### `autoplayInterval`

defaultValue: `3000`


### `autoplaySpeed`

Delay between each auto scoll in ms.

type: `number`


### `bookmarks` (required)

The bookmark data. An array of objects with name (string, required), description (string, required) and extent (array of number, required) keys.
The extent should be in the view projection.

type: `arrayOf shape`


### `className`

Css class name to apply on the menu or the div.

type: `string`


### `dots`

Should we show indicators? These are dots to navigate the bookmark pages.

type: `bool`
defaultValue: `true`



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

Animation duration.

type: `bool`
defaultValue: `true`


### `speed`

Should we display a marker for the bookmark?

type: `number`


### `width`

Used to hardcode the slider width. Accepts any string dimension value such as "80%" or "500px".

type: `string`
defaultValue: `'400px'`


### `wrapAround`

Sets infinite wrapAround mode. Defaults to true

type: `bool`
defaultValue: `true`

