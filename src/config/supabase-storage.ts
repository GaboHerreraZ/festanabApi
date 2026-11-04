import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const RECEIPTS_BUCKET =
  process.env.SUPABASE_RECEIPTS_BUCKET || "payment-receipts";

let client: SupabaseClient | null = null;

// Perezoso a propósito: createClient lanza si la llave viene vacía, y este
// módulo se carga junto con el router, así que crear el cliente arriba tumba
// todo el API cuando SUPABSE_SERVICE_ROLE_KEY no está configurada. Así solo
// falla la subida de comprobantes, con un 500 que dice qué falta.
export const getSupabaseStorage = () => {
  if (client) return client;

  const supabaseUrl = process.env.SUPABSE_API_URL || "";
  const supabaseServiceKey = process.env.SUPABSE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Falta SUPABSE_API_URL o SUPABSE_SERVICE_ROLE_KEY: no se pueden guardar comprobantes de pago"
    );
  }

  client = createClient(supabaseUrl, supabaseServiceKey);

  return client;
};
