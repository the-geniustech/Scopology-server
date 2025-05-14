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
  clientType: ClientType;
  clientBio?: string;
  clientLogo?: {
    url: string;
    publicId: string;
  };
}
