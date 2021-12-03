<template lang='pug'>
common-button(
  label='Регистратор'
  to='/disposal'
  )
  disposal-icon(size='2rem')
</template>

<script>
import CommonButton from './CommonButton.vue'
import DisposalIcon from 'components/icons/DisposalIcon.vue'
export default {
  name: 'DisposalButton',
  components: { CommonButton, DisposalIcon }
}
</script>
