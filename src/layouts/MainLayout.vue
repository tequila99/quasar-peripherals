<template lang='pug'>
q-layout(view='lHh Lpr lFf')
  main-header(@toggle-drawer='leftDrawerOpen=!leftDrawerOpen')
  main-drawer(v-model='leftDrawerOpen')
  main-footer
  q-page-container
    router-view
</template>

<script>
import MainHeader from './MainHeader.vue'
import MainDrawer from './MainDrawer.vue'
import MainFooter from './MainFooter.vue'
export default {
  name: 'MainLayout',
  data () {
    return {
      leftDrawerOpen: false
    }
  },
  components: {
    MainHeader, MainDrawer, MainFooter
  }
}
</script>
