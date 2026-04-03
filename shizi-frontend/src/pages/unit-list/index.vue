<template>
  <UnitListPage />
</template>

<script lang="ts" setup>
import UnitListPage from './components/UnitListPage.vue'

definePage({
  style: {
    navigationBarTitleText: '学习单元',
    navigationStyle: 'custom',
  },
})
</script>
