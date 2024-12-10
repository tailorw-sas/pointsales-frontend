<template>
    <div class="flex justify-content-center align-center">
        <div class="p-4" style="width: 100%;">
            <div class="card">
                <EditForm
                    :key="dialogReload"
                    :list-fields="formConfig"
                    :form-options="formOptionsToEdit"
                    @close="goToList" 
                    @save="goToList"
                >
                </EditForm>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import type { IFormField } from '@/@core/fields/interfaces/IFieldInterfaces';
import EditForm from '@/@core/form/EditForm.vue';
import { useRoute } from 'vue-router';
import {ref } from 'vue';

const route = useRoute()
const dialogReload = ref(0)


const formConfig = ref<IFormField>(
    {
        image: {
            value: '',
            label: 'Logo',
            type: 'image',
            isRequired: true,
            showRequiredLabel: true,
            placeholder: '',
            errorMessage: [],
            haveError: false,
            showCounter: false,
            validationKeywords: [],
            col: '12'
        },
        name: {
            value: '',
            label: 'Nombre',
            type: 'text',
            isRequired: true,
            showRequiredLabel: true,
            placeholder: '',
            errorMessage: [],
            haveError: false,
            maxLength: 5,
            showCounter: true,
            validationKeywords: [],
            col: '3'
        },
        type: {
            value: '',
            label: 'Tipo de Servicio',
            type: 'select',
            isRequired: true,
            showRequiredLabel: true,
            placeholder: 'Seleccione un tipo de servicio',
            moduleApi: 'calendar',
            uriApi: 'service-type',
            filter: [],
            errorMessage: [],
            haveError: false,
            returnObject: true,
            showCounter: true,
            validationKeywords: [],
            col: '3'
        },
        normalAppointmentPrice: {
            value: '',
            label: 'Precio',
            type: 'number',
            isRequired: true,
            showRequiredLabel: true,
            placeholder: '',
            errorMessage: [],
            haveError: false,
            maxLength: 5,
            showCounter: true,
            validationKeywords: ['maxLength'],
            col: '3'
        },
        expressAppointmentPrice: {
            value: '',
            label: 'Precio Express',
            type: 'number',
            isRequired: true,
            showRequiredLabel: true,
            placeholder: '',
            errorMessage: [],
            haveError: false,
            maxLength: 5,
            showCounter: true,
            validationKeywords: ['maxLength'],
            col: '3'
        },
        description: {
            value: '',
            label: 'Descripción',
            type: 'textarea',
            isRequired: true,
            showRequiredLabel: true,
            placeholder: '',
            errorMessage: [],
            haveError: false,
            validationKeywords: [],
            col: '12'
        },
    }
)

const formOptionsToEdit = ref({
    moduleApi: 'calendar',
    uriApi: 'service',
    itemId: route.params ? route.params.id.toString() : '',
    btnTextSave: 'Aceptar',
    btnTextCancel: 'Cancelar',
});


const goToList = (() => {
    router.push({name: 'services'})
})


</script>