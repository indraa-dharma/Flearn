import { cookies } from "next/headers";
import { translations, LangKey } from "./translations";

export async function getServerLanguage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("flearn-language")?.value as LangKey) || "id";
  const isValidLang = Object.keys(translations).includes(lang);
  
  return {
    lang: isValidLang ? lang : "id",
    t: translations[isValidLang ? lang : "id"],
  };
}
