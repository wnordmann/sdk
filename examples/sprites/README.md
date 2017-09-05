# Making sprites

`sprites.json`, `sprites.png`, `sprites@2x.json`, `sprites@2x.png` are generated using the `@mapbox/spritezero-cli` package.

The sprites used are in the `sprites-src/` directory.

Double pixel density `@2x` files are needed for Higher Pixel density screens

## To generate the sprites

```bash
spritezero sprites ./sprites-src
spritezero --retina sprites@2x ./sprites-src
```

## Image Credits

* duck.svg - https://openclipart.org/detail/159499/rubber-duck
* goose.svg - https://openclipart.org/detail/282727/goose-vectorized
* grey-duck.svg - A greyscale version of duck.svg.
