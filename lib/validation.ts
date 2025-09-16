import { z } from "zod";

export const PropertyType = [
  "Einfamilienhaus",
  "Mehrfamilienhaus",
  "Gewerbeimmobilie",
] as const;

export const Orientations = [
  "Süd",
  "West",
  "Ost",
  "Nord",
  "Keine Angabe",
] as const;

export const RoofAge = [
  "Unter 5 Jahre",
  "5–15 Jahre",
  "Über 15 Jahre",
  "Keine Angabe",
] as const;

export const Consumption = [
  "Unter 3.000 kWh",
  "3.000–5.000 kWh",
  "Über 5.000 kWh",
  "Keine Angabe",
] as const;

export const OtherSolutions = ["Ja", "Nein", "Weis nicht"] as const;

export const contactSchema = z.object({
  name: z.string().min(1, "Name darf nicht leer sein").optional(),
  email: z.string().email("Ungültige E-Mail").optional(),
  phone: z.string().regex(/^\+?[0-9\s\-().]{7,}$/, "Ungültige Telefonnummer").optional(),
}).partial().optional();

export const surveySchema = z.object({
  propertyType: z.enum(PropertyType),
  orientations: z.array(z.enum(Orientations)).min(1, "Mindestens eine Dachausrichtung wählen")
    .superRefine((arr, ctx) => {
      if (arr.includes("Keine Angabe") && arr.length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "\"Keine Angabe\" darf nicht mit anderen Optionen kombiniert werden",
        });
      }
    }),
  roofAge: z.enum(RoofAge),
  annualConsumption: z.enum(Consumption),
  interestedInOtherSolutions: z.enum(OtherSolutions),
  contact: contactSchema,
});

export type SurveyInput = z.infer<typeof surveySchema>;
