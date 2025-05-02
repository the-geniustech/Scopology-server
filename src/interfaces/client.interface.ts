export enum ClientType {
  INDUSTRIAL = "Industrial",
  RESIDENTIAL = "Residential",
  COMMERCIAL = "Commercial",
}

export interface IClient extends Document {
  clientBusinessName: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  clientNatureOfBusiness: ClientType;
  clientBio?: string;
  clientLogo?: {
    url: string;
    publicId: string;
  };
}
