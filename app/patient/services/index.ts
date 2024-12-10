import type { IQueryRequest, IStandardObject } from "@/@core/fields/interfaces/IFieldInterfaces";
import { GenericService } from "@/@core/services/generic-services";

export const BusinessService = {
     async getListBusiness(payload: IQueryRequest) {    
        try {    
            let listItems: IStandardObject[] = []        
            const response = await GenericService.search('identity', 'business', payload);
            
            for (const iterator of response.data.data) {

                const responseLogo = await GenericService.getImageById('cloudbridges', 'images', iterator.image);
                const payload = {
                    id: iterator.id,
                    name: iterator.name,
                    logo: '',
                    ruc: iterator.ruc
                }
                if (responseLogo.data) {
                    payload.logo = `data:image/png;base64,${responseLogo.data}`;
                }
                listItems = [...listItems, payload]
            }
            return listItems
        } catch (error) {
            console.error(error);
            return []
        }
    }

}