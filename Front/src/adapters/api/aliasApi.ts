import type { AliasService, CreateFullUserService, ResolveAliasService } from "../../application/aliasService";
import type { AliasDetail } from "../../domain/alias";
import type { Account } from "../../domain/account";

const API_BASE_URL = "http://localhost:8080/api/v1";

export const aliasAdapter: AliasService = {
    getAllAliasDeteails: async () => {
        const response = await fetch(`${API_BASE_URL}/alias/list`);
        if (!response.ok){
            throw new Error("Error al obtener el detalle de los alias")
        }
        return response.json();
    },
    resolveAlias: async (alias: string) => {
        const response = await fetch(`${API_BASE_URL}/alias/resolve?value=${alias}`);
        if (!response.ok){
            throw new Error("Alias no encontrado"); 
        }
        return response.json();
    },
   
    createFullUser: async (data: CreateFullUserService): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/users/full`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Error al crear el usuario");
        }
      },

      addAccountToCustomer: async (
        documentNumber: string,
        email: string,
        aliasValue: string,
        account: Omit<Account, "id" | "customer_id" | "created_at">
      ): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/accounts`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                documentNumber,
                email,
                aliasValue,
                account,
            }),
            
        });
        if(!response.ok){
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || "Error al agregar la cuenta al cliente");
        }
      } 
    
};