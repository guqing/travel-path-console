import * as L from 'leaflet'

L.TileLayer.loadTileLayer = L.TileLayer.extend({ // eslint-disable-line
  getTileUrl: function (coords) {
    var data = {
      // r: retina ? '@2x' : '',
      s: this._getSubdomain(coords),
      x: coords.x,
      y: this._globalTileRange.max.y - coords.y,
      z: this._getZoomForUrl()
    }

    return L.Util.template(this._url, L.extend(data, this.options)) // eslint-disable-line
  }
})

L.tileLayer.loadTileLayer = function (url, options) {// eslint-disable-line
  return new L.TileLayer.loadTileLayer(url, options) // eslint-disable-line
}
