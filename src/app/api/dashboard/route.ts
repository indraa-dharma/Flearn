import { handleApiError, jsonSuccess } from "@/lib/api-response";
import { getDashboardData } from "@/lib/dashboard/service";

export async function GET() { 
  try { 
    const dashboard = await getDashboardData(); 
    return jsonSuccess({ dashboard }); 
  } catch (e) { 
    return handleApiError(e); 
  } 
}
