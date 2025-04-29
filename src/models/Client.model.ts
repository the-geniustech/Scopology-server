import { ClientType, IClient } from "@interfaces/client.interface";
import mongoose, { Schema } from "mongoose";

/*
clientBusinessName
clientName
clientAddress
clientContact
clientNatureOfBusiness
clientBio
clientLogo
*/

const clientSchema = new Schema<IClient>(
  {
    clientBusinessName: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientAddress: {
      type: String,
      required: true,
      trim: true,
    },
    clientContact: {
      type: String,
      required: true,
      trim: true,
    },
    clientNatureOfBusiness: {
      type: String,
      enum: Object.values(ClientType),
      required: true,
      trim: true,
    },
    clientBio: {
      type: String,
      trim: true,
    },
    clientLogo: {
      type: {
        url: String,
        publicId: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model<IClient>("Client", clientSchema);
export default Client;
