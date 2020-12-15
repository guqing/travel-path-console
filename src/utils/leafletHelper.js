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

export var checkPointIcon = new CheckPointIcon()

export var PresetIcon = L.Icon.extend({
  options: {
    iconUrl: require('@/assets/checkpoint/geekblue.svg'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowAnchor: [14, 41],
    iconSize: [25, 39],
    iconAnchor: [13, 38]
  }
})

export var DesignIcon = L.Icon.extend({
  options: {
    iconUrl: require('@/assets/checkpoint/red.svg'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowAnchor: [14, 41],
    iconSize: [25, 39],
    iconAnchor: [13, 38]
  }
})

export var designIcon = new DesignIcon()
