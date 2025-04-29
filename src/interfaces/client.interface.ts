export enum ClientType {
  INDUSTRIAL = "Industrial",
  RESIDENTIAL = "Residential",
  COMMERCIAL = "Commercial",
}

export interface IClient extends Document {
  clientBusinessName: string;
  clientName: string;
  clientAddress: string;
  clientContact: string;
  clientNatureOfBusiness: ClientType;
  clientBio?: string;
  clientLogo?: {
    url: string;
    publicId: string;
  };
}
