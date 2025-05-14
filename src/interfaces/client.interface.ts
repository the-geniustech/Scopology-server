export enum ClientType {
  INDUSTRIAL = "Industrial",
  RESIDENTIAL = "Residential",
  COMMERCIAL = "Commercial",
}

export interface IClient extends Document {
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientPurchaseNumber: string;
  clientEmail: string;
  clientNatureOfBusiness: ClientType;
  clientBio?: string;
  clientLogo?: {
    url: string;
    publicId: string;
  };
}
