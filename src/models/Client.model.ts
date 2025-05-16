import { ClientType, IClient } from "@interfaces/client.interface";
import mongoose, { Schema } from "mongoose";

const clientSchema = new Schema<IClient>(
  {
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
    clientPurchaseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    clientNature: {
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
    versionKey: false,
  }
);

const Client = mongoose.model<IClient>("Client", clientSchema);
export default Client;
