export enum ClientType {
  INDUSTRIAL = "Industrial",
  RESIDENTIAL = "Residential",
  COMMERCIAL = "Commercial",
}

export interface IClient extends Document {
  brandName: string;
  name: string;
  address: string;
  contact: string;
  natureOfBusiness: ClientType;
  logo?: {
    url: string;
    publicId: string;
  };
}
