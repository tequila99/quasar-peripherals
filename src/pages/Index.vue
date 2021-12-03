<template lang='pug'>
q-page.q-pa-md.column.justify-between
  h5.text-center.q-mb-xl.text-primary Программа настройки вспомогательных устройств для
    .bold ПК Квазар.Фарм.
  q-img.q-ml-auto.q-mr-auto(
    src='~assets/pngwing.com.png'
    alt='Сканеры и оборудование'
    style='max-width:400px;max-height:400px;'
  )
  div.flex.column.text-teal
    div.text-center (c) ООО Медсофт,
    div.text-center 2021 г.

</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageIndex'
})
</script>
