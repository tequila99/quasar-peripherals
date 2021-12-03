<template lang='pug'>
common-button(
  label='Картридер'
  to='/card-reader'
  )
  card-icon(size='2rem')
</template>

<script>
import CommonButton from './CommonButton.vue'
import CardIcon from 'components/icons/CardIcon.vue'
export default {
  name: 'CardButton',
  components: { CommonButton, CardIcon }
}
</script>
