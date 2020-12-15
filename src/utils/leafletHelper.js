import * as L from 'leaflet'

var MyIcon = L.Icon.extend({
  options: {
    iconUrl: require('@/assets/checkpoint/geekblue.svg'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowAnchor: [14, 41],
    iconSize: [25, 39],
    iconAnchor: [13, 38]
  }
})

export var uncheckedIcon = new MyIcon({
  iconUrl: require('@/assets/checkpoint/unchecked.svg')
})

export var startIcon = new MyIcon({
  iconUrl: require('@/assets/checkpoint/start_point.svg')
})
export var endIcon = new MyIcon({
  iconUrl: require('@/assets/checkpoint/end_point.svg')
})
export var waypointIcon = new MyIcon({
  iconUrl: require('@/assets/checkpoint/blue.svg')
})

export var checkedIcon = new MyIcon({
  iconUrl: require('@/assets/checkpoint/red.svg')
})

export var defaultIcon = new MyIcon({
  iconUrl: require('@/assets/checkpoint/geekblue.svg')
})
