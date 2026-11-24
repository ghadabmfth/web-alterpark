import { permanentRedirect } from "next/navigation";
import { routes } from "@/config/site";

/* The access plan is per site: the historical /plan-acces URL opens Nantes. */
export default function AccessIndex() {
  permanentRedirect(`${routes.access}/nantes`);
}
