import type { AgeGroup } from '@/types/ui'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { normalizeAgeGroup } from '@/utils/ui-mode'

const PARENT_MODE_DURATION = 10 * 60 * 1000

export const useUiStore = defineStore(
  'ui',
  () => {
    const ageGroup = ref<AgeGroup>('preschool')
    const parentModeExpiresAt = ref(0)
    const audioEnabled = ref(true)
    const reducedMotion = ref(false)

    const isParentMode = computed(() => parentModeExpiresAt.value > Date.now())

    function setAgeGroup(value: unknown) {
      ageGroup.value = normalizeAgeGroup(value)
    }

    function enterParentMode() {
      parentModeExpiresAt.value = Date.now() + PARENT_MODE_DURATION
    }

    function leaveParentMode() {
      parentModeExpiresAt.value = 0
    }

    function setAudioEnabled(value: boolean) {
      audioEnabled.value = value
    }

    function setReducedMotion(value: boolean) {
      reducedMotion.value = value
    }

    return {
      ageGroup,
      parentModeExpiresAt,
      audioEnabled,
      reducedMotion,
      isParentMode,
      setAgeGroup,
      enterParentMode,
      leaveParentMode,
      setAudioEnabled,
      setReducedMotion,
    }
  },
  {
    persist: {
      paths: ['ageGroup', 'audioEnabled', 'reducedMotion'],
    },
  },
)
