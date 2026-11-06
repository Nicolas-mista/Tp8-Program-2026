"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { assignVariant, isValidVisitor } from "@/lib/experiment";
import { recordConversion } from "@/lib/db";

/**
 * Única vía de conversión: el submit del CTA.
 * Una por visitante; el índice único de la base ignora los clics repetidos.
 */
export async function reserve() {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get("tn_visitor")?.value;

  if (isValidVisitor(visitorId)) {
    recordConversion(visitorId, assignVariant(visitorId));
  }

  redirect("/practica?gracias=1");
}
