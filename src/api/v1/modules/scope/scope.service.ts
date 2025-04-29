import Scope from "@models/Scope.model";
import { IScope } from "@interfaces/scope.interface";

export const createScope = async (data: Partial<IScope>) => {
  const scope = new Scope(data);
  return await scope.save();
};

export const getScopeById = async (id: string) => {
  return await Scope.findById(id);
};

export const listScopes = async () => {
  return await Scope.find({ deletedAt: null });
};

export const updateScope = async (id: string, updates: Partial<IScope>) => {
  return await Scope.findByIdAndUpdate(id, updates, { new: true });
};

export const softDeleteScope = async (id: string) => {
  return await Scope.findByIdAndUpdate(
    id,
    { deletedAt: new Date() },
    { new: true }
  );
};
