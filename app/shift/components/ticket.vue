<script>
export default {
  props: {
    shiftCode: {
      type: String,
      required: true
    },
    serviceName: {
      type: String,
      required: true
    },
    identification: {
      type: String,
      required: true
    }
  }
}
</script>

<template>
  <div id="ticket">
    <h4 style="text-align: center; font-size: 20px;">
      Turno de Atención
    </h4>
    <h2
      style=" border: 1px solid #000; border-radius: 10px; height: 2.5rem; margin: 0 auto; text-align: center; font-size: 30px"
      class="w-15rem mt-4 justify-content-center"
    >
      {{ shiftCode }}
    </h2>
    <p
      class="mt-3 mb-5 justify-content-center"
      style="text-transform: uppercase; font-weight: bold; text-align: center; font-size: 14px;"
    >
      CI: {{ identification }}
    </p>
    <p
      class="mt-3 mb-5 justify-content-center"
      style="text-transform: uppercase; font-weight: bold; text-align: center"
    >
      {{ serviceName }}
    </p>
    <p style="text-align: center;">
      <b>Fecha: </b>{{ new Date().toLocaleString() }} <br>
      ¡Gracias por confiar en nosotros!
    </p>
  </div>
</template>

<style scoped lang="scss">
#ticket {
  width: 50mm;
  /* Ancho típico de un ticket */
  height: 50mm;
  /* Altura automática para ajustarse al contenido */
  padding: 0;
  /* Espacio alrededor del contenido */
  border: 1px solid #000;
  text-align: center;
  font-size: 20px;
}

@media print {
  @page {
    size: 80mm 80mm;
    /* Configurar tamaño de página para impresión */
    margin: 0;
    /* Sin márgenes */
  }

  body * {
    visibility: hidden;
    -webkit-print-color-adjust: exact; /* Mejora la reproducción del color */
    print-color-adjust: exact;
    image-rendering: high-quality; /* Renderiza imágenes con alta calidad */
    font-family: Arial, sans-serif;
    font-size: 4mm;
  }

  #ticket,
  #ticket * {
    visibility: visible;
  }

  #ticket {
    width: 80mm;
    height: 80mm;
    margin: 0;
    padding: 0;
    text-align: center;
    font-size: 4mm;
    font-family: 'Arial', sans-serif;
    color: #000;
    background: #fff;
    image-rendering: optimizeQuality; /* Mejora la calidad de las imágenes */
    -webkit-font-smoothing: antialiased; /* Mejora la claridad del texto en WebKit */
    //font-smoothing: antialiased; /* Mejora la claridad del texto */
    -moz-osx-font-smoothing: grayscale;
  }
  h1, p {
    margin: 0;
    padding: 0;
  }

  html,
  body {
    height: 100%;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
</style>
