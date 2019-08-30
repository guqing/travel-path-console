import moment from 'moment'

export const presetMarkerOption = {
  title: '预设卡口',
  draggable: true,
  autoPan: true
}

export const tableColums = [
  {
    title: '编号',
    dataIndex: 'id',
    key: 'id',
    customRender: function (text, record, index) {
      // 行号
      return index + 1
    }
  },
  {
    title: '方案名称',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '方案备注',
    dataIndex: 'description',
    scopedSlots: { customRender: 'description' }
  },
  {
    title: '数据量',
    dataIndex: 'bayonetCount',
    sorter: true,
    scopedSlots: { customRender: 'modifyTime' }
  },
  {
    title: '创建时间',
    dataIndex: 'modifyTime',
    sorter: true,
    scopedSlots: { customRender: 'modifyTime' },
    customRender: function (text, record, index) {
      return moment(text).format('YYYY-MM-DD')
    }
  },
  {
    table: '操作',
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' }
  }
]

export const generateCarNumber = function () {
  var licenceArray = ['京', '津', '冀', '晋', '内蒙古', '辽', '吉', '黑', '沪', '苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘', '粤', '桂', '琼', '渝', '川', '黔', '滇', '藏', '陕', '甘', '青', '宁', '新', '港', '澳', '台']

  var municipality = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  var carId = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

  var municipalityIndex = parseInt(Math.random() * 3)
  // console.debug('随机生成0-2之间的数（包含0和2）：' + municipalityIndex);
  var carNumber = licenceArray[parseInt(Math.random() * licenceArray.length - 1)] + municipality[municipalityIndex] + '·'

  for (var i = 0; i < 5; i++) {
    carNumber += carId[parseInt(Math.random() * carId.length - 1)]
  }

  return carNumber
}

export function timeAgo (time) {
  var currentTime = new Date().getTime()
  var between = currentTime - time
  var days = Math.floor(between / (24 * 3600 * 1000))
  if (days === 0) {
    var leave1 = between % (24 * 3600 * 1000)
    var hours = Math.floor(leave1 / (3600 * 1000))
    if (hours === 0) {
      var leave2 = leave1 % (3600 * 1000)
      var minutes = Math.floor(leave2 / (60 * 1000))
      if (minutes === 0) {
        var leave3 = leave2 % (60 * 1000)
        var seconds = Math.round(leave3 / 1000)
        return seconds + ' 秒前'
      }
      return minutes + ' 分钟前'
    }
    return hours + ' 小时前'
  }
  if (days < 0) return '刚刚'
  if (days < 5) {
    return days + ' 天前'
  } else {
    return moment(time).format('YYYY-MM-DD HH:mm')
  }
}
