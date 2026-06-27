import type { BillDocument, Business, Store } from "@gpbm/shared";
import { demoBills, demoBusiness, demoStores } from "../demo";

export interface DatabaseService {
  getCurrentBusiness(): Promise<Business>;
  listStores(businessId: string): Promise<Store[]>;
  listBills(businessId: string): Promise<BillDocument[]>;
}

export class PlaceholderDatabaseService implements DatabaseService {
  async getCurrentBusiness(): Promise<Business> {
    return demoBusiness;
  }

  async listStores(businessId: string): Promise<Store[]> {
    return demoStores.filter((store) => store.business_id === businessId);
  }

  async listBills(businessId: string): Promise<BillDocument[]> {
    return demoBills.filter((bill) => bill.business_id === businessId);
  }
}
