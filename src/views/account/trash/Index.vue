<template>
  <div class="page-header-index-wide">
    <a-card :bordered="false" :bodyStyle="{ padding: '16px 25px', height: '100%' }" :style="{ height: '100%' }">
      <a-tabs defaultActiveKey="1" @change="callback">
        <a-tab-pane tab="预选卡口方案" key="1">
          <Preset></Preset>
        </a-tab-pane>
        <a-tab-pane tab="布设卡口方案" key="2" forceRender>
          <ActualBayonet></ActualBayonet>
        </a-tab-pane>
        <a-tab-pane tab="途经卡口方案" key="3">
          <Via></Via>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script>
import { mixinDevice } from '@/utils/mixin.js'

import Preset from '@/views/account/trash/Preset'
import ActualBayonet from '@/views/account/trash/ActualBayonet'
import Via from '@/views/account/trash/Via'

export default {
  components: {
    Preset,
    ActualBayonet,
    Via
  },
  mixins: [mixinDevice],
  data () {
    return {
      pageTitle: ''
    }
  },
  methods: {
    callback (key) {
      console.log(key)
    }
  }
}
</script>
