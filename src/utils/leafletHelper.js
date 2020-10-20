import * as L from 'leaflet'

export var CheckPointIcon = L.Icon.extend({
  options: {
    iconUrl: require('@/assets/checkpoint/pink.svg'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowAnchor: [14, 41],
    iconSize: [25, 39],
    iconAnchor: [13, 38]
  }
})
