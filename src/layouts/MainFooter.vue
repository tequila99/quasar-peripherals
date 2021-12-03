<template lang='pug'>
q-footer.q-pb-sm.bg-white.text-primary(bordered)
  .q-ml-auto.q-mr-auto.flex.justify-evenly(style='width:400px;max-width:600px;')
    scanner-button
      q-tooltip Настройка и тестирование сканера штрих-кодов
    disposal-button
      q-tooltip Настройка и тестирование регистратора выбытия
    card-button
      q-tooltip Настройка и тестирование картридера
</template>

<script>
import ScannerButton from 'components/buttons/ScannerButton.vue'
import DisposalButton from 'components/buttons/DisposalButton.vue'
import CardButton from 'components/buttons/CardButton.vue'
export default {
  name: 'MainFooter',
  props: {},
  data () {
    return {

    }
  },
  watch: {},
  computed: {},
  methods: {},
  created () {},
  mounted () {},
  components: { ScannerButton, DisposalButton, CardButton }
}
</script>

<style lang='scss' scoped>
</style>
