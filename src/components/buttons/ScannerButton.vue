<template lang='pug'>
common-button(
  label='Сканер'
  to='/scanner'
  )
  scanner-icon(size='2rem')
</template>

<script>
import CommonButton from './CommonButton.vue'
import ScannerIcon from 'components/icons/ScannerIcon.vue'

export default {
  name: 'ScannerButton',
  components: { CommonButton, ScannerIcon }
}
</script>
