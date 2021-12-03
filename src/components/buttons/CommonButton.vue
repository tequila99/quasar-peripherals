<template lang='pug'>
q-btn(
  :label='label'
  stack
  flat
  :to='to'
  :class='{ "text-grey": isActive }'
  )
  slot
</template>

<script>

export default {
  name: 'CommonButton',
  props: {
    label: {
      type: String,
      default: ''
    },
    to: {
      type: String,
      default: ''
    }
  },
  computed: {
    isActive () {
      return this.routePath === this.to
    },
    routePath () {
      return this.$route.path
    }
  }
}
</script>
