<template lang='pug'>
q-drawer(
  :value='value'
  show-if-above
  bordered
  @input='$emit("input", false)'
)
  q-list
    q-item-label(header) Основное меню
</template>

<script>
export default {
  name: 'MainDrawer',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
