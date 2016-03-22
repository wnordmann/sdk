`Bookmarks` (component)
=======================

Adds the ability to retrieve spatial bookmarks.
A spatial bookmark consists of a name, an extent and a description.

```javascript
var bookmarks = [{
  name: 'Le Grenier Pain',
  description: '<b>Address: </b>38 rue des Abbesses<br><b>Telephone:</b> 33 (0)1 46 06 41 81<br><a href=""http://www.legrenierapain.com"">Website</a>',
  extent: [259562.7661267497, 6254560.095662868, 260675.9610346824, 6256252.988234103]
}, {
  name: 'Poilne',
  description: '<b>Address: </b>8 rue du Cherche-Midi<br><b>Telephone:</b> 33 (0)1 45 48 42 59<br><a href=""http://www.poilane.fr"">Website</a>',
   extent: [258703.71361629796, 6248811.5276565505, 259816.90852423065, 6250503.271278702]
}];

class BookmarkApp extends App {
  render() {
    return (
      <div id='content'>
        <div ref='map' id='map'>
          <div id='bookmarks-panel'>
            <Bookmarks introTitle='Paris bakeries' introDescription='Explore the best bakeries of the capital of France' map={map} bookmarks={bookmarks} />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<IntlProvider locale='en' messages={enMessages}><BookmarkApp map={map} /></IntlProvider>, document.getElementById('main'));
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


### `autoplaySpeed`

delay between each auto scoll in ms.

type: `number`


### `bookmarks` (required)

The bookmark data. An array of objects with name (string, required), description (string, required) and extent (array of number, required) keys.
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

