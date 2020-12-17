import * as L from 'leaflet'
import './numberedMarker.js'
import './numberedMarker.css'

export function createNumberedMarker(coord, index) {
  return new L.Marker(coord, { icon: new L.NumberedDivIcon({ number: index }) })
}

export var numberedDivIcon = function(index) {
  return new L.NumberedDivIcon({
    number: index
  })
}
