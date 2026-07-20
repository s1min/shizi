<script setup lang="ts">
import type { AgeGroup } from '@/types/ui'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { tabbarStore } from '@/tabbar/store'

const props = withDefaults(defineProps<{
  class?: string
  hideTabbar?: boolean
  safeBottom?: boolean
  ageGroup?: AgeGroup
}>(), {
  hideTabbar: false,
  safeBottom: true,
  ageGroup: 'preschool',
})

let tabbarHidden = false

function syncTabbarVisibility(shouldHide: boolean) {
  if (shouldHide && !tabbarHidden) {
    tabbarStore.hide()
    tabbarHidden = true
  }
  else if (!shouldHide && tabbarHidden) {
    tabbarStore.show()
    tabbarHidden = false
  }
}

onMounted(() => syncTabbarVisibility(props.hideTabbar))
watch(() => props.hideTabbar, syncTabbarVisibility)
onBeforeUnmount(() => syncTabbarVisibility(false))
</script>

<template>
  <view
    class="paper-page paper-safe-top"
    :class="[
      props.class,
      { 'paper-safe-bottom': safeBottom, 'paper-tabbar-safe-bottom': !hideTabbar },
      `paper-page--${ageGroup}`,
    ]"
    :data-age-group="ageGroup"
  >
    <slot />
  </view>
</template>
