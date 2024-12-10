import type { IQueryRequest, IStandardObject } from '@/@core/fields/interfaces/IFieldInterfaces'
import { GenericService } from '@/@core/services/generic-services'

export const ServicesService = {
  async getList(payload: IQueryRequest) {
    try {
      let listItems: IStandardObject[] = []
      const response = await GenericService.search('calendar', 'service', payload)

      for (const iterator of response.data) {
        try {
          const payload = {
            id: iterator.id,
            name: iterator.name,
            image: '',
            desc: iterator.description,
          }
          listItems = [...listItems, payload]
        }
        catch (error) {

        }
      }
      return listItems
    }
    catch (error) {
      console.error(error)
      return []
    }
  },

  async getListSelected(module: string, uriApi: string, id: string) {
    try {
      let listItems: IStandardObject[] = []
      const response = await GenericService.getById(module, uriApi, id)
      for (const iterator of response.data) {
        const payload = {
          id: iterator.id,
          name: iterator.name,
          logo: '',
          desc: iterator.description,
          cantPermissions: ''
        }
        listItems = [...listItems, payload]
      }
      return listItems
    }
    catch (error) {
      console.error(error)
      return []
    }
  }

}
