`Playback` (component)
======================

Adds a slider to the map that can be used to select a given date, and modifies the visibility of layers and features depending on their timestamp and the current time.

Properties
----------

### `autoPlay`

Should the playback tool start playing automatically?

type: `bool`
defaultValue: `false`


### `interval`

The time, in milliseconds, to wait in each position of the slider. Positions are defined by dividing the slider range by the number of intervals defined in the numIntervals parameter.

type: `number`
defaultValue: `500`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The map whose time-enabled layers should be filtered. Time-enabled layers are layers that have a timeInfo property.

type: `instanceOf ol.Map`


### `maxDate` (required)

The maximum date to use for the slider field and the date picker.

type: `number`


### `minDate` (required)

The minimum date to use for the slider field and the date picker.

type: `number`


### `numIntervals`

The number of intervals into which the full range of the slider is divided.

type: `number`
defaultValue: `100`

