import { IClient } from "@interfaces/client.interface";
import Client from "@models/Client.model";

export const createClient = async (data: Partial<IClient>) => {
  return await Client.create(data);
};
