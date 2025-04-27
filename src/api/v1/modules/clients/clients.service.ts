import { IClient } from "@interfaces/client.interface";
import Client from "@models/Client.model";

export const createClient = async (data: Partial<IClient>) => {
  return await Client.create(data);
};

export const getClients = async () => {
  return await Client.find().sort({ createdAt: -1 });
};

export const getClientById = async (id: string) => {
  return await Client.findById(id);
};

export const updateClient = async (id: string, data: Partial<IClient>) => {
  return await Client.findByIdAndUpdate(id, data, { new: true });
};

export const deleteClient = async (id: string) => {
  return await Client.findByIdAndDelete(id);
};
