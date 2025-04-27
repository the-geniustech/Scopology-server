import { ClientType, IClient } from "@interfaces/client.interface";
import mongoose, { Schema } from "mongoose";

const clientSchema = new Schema<IClient>(
  {
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    natureOfBusiness: {
      type: String,
      enum: Object.values(ClientType),
      required: true,
      trim: true,
    },
    logo: {
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
