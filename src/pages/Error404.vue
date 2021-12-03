<template lang='pug'>
div.fullscreen.bg-blue.text-white.text-center.q-pa-md.flex.flex-center
  div
    div(style='font-size: 30vh') 404
    .text-h2(style='opacity:.4') Здесь ничего нет...
    q-btn.q-mt-xl(
      color='white'
      text-color='blue'
      unelevated
      to='/'
      label='В начало'
      no-caps
    )
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Error404'
})
</script>
