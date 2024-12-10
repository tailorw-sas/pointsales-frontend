<script setup lang="ts">
import { ref } from 'vue'
import QRCode from 'qrcode'
import dayjs from 'dayjs'

const props = defineProps({
  openDialog: {
    type: Boolean,
    required: true
  },
  businessId: {
    type: String,
    required: true,
  }
})

const emits = defineEmits(['submit', 'close'])



// VARIABLES -----------------------------------------------------------------------------------------
const dialogVisible = ref(props.openDialog)
const qrCodeUrl = ref('')

// FUNCIONES -----------------------------------------------------------------------------------------
function generateQRCode(text: string) {
    QRCode.toDataURL(text, { width: 300 }, (err, url) => {
        if (!err) {
            qrCodeUrl.value = url
        }
    })
}

function downloadQRCode() {
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss')
    const link = document.createElement('a')
    link.href = qrCodeUrl.value
    link.download = `qr_code_${timestamp}.png`
    link.click()
}

function closeDialog() {
  emits('close')
}

onMounted(() => {
    dialogVisible.value = props.openDialog
    generateQRCode(props.businessId)
})
</script>

<template>
  <div>
    <Dialog
      v-model:visible="dialogVisible"
      modal
      style="width: 350px;"
      content-class="border-round-bottom border-top-1 surface-border"
      @hide="closeDialog"
    >
      <template #header>
        <div class="flex justify-content-between">
          <h5 class="m-0">
            Código QR
          </h5>
        </div>
      </template>
      <div class="flex justify-content-center mt-4">
        <img :src="qrCodeUrl" alt="Código QR" />
      </div>
        <div class="flex justify-content-center">
            <Button
                label="Descargar QR"
                icon="pi pi-download"
                class="p-button-outlined mt-3 justify-content-center"
                @click="downloadQRCode"
            />
        </div>
      <!-- </template> -->
    </Dialog>
  </div>
</template>

<style scoped lang="scss">

</style>
