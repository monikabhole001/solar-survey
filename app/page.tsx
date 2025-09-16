"use client";

import { useState } from "react";
import { PropertyType, Orientations, RoofAge, Consumption, OtherSolutions } from "@/lib/validation";

type ApiError = { errors: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } };
type ApiOk = { verdict: "yes" | "no" };

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"yes" | "no" | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setErrors([]);

    const fd = new FormData(e.currentTarget);
    const orientations = Orientations.filter((o) => (fd.getAll("orientations") as string[]).includes(o));

    const payload = {
      propertyType: fd.get("propertyType"),
      orientations,
      roofAge: fd.get("roofAge"),
      annualConsumption: fd.get("annualConsumption"),
      interestedInOtherSolutions: fd.get("interestedInOtherSolutions"),
      contact: (() => {
        const name = (fd.get("name") as string) || "";
        const email = (fd.get("email") as string) || "";
        const phone = (fd.get("phone") as string) || "";
        if (!name && !email && !phone) return undefined;
        return {
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
        };
      })(),
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as ApiError;
        const msgs = [
          ...(data?.errors?.formErrors ?? []),
          ...Object.values(data?.errors?.fieldErrors ?? {}).flat(),
        ];
        setErrors(msgs.length ? msgs : ["Bitte prüfen Sie Ihre Eingaben."]);
      } else {
        const data = (await res.json()) as ApiOk;
        setResult(data.verdict);
      }
    } catch {
      setErrors(["Netzwerkfehler. Bitte später erneut versuchen."]);
    } finally {
      setLoading(false);
    }
  };

  if (result === "yes") {
    return (
      <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>Ergebnis: Gute Voraussetzungen 🎉</h1>
        <p>Ihre Angaben deuten darauf hin, dass sich eine Solaranlage lohnen könnte.</p>
        <button onClick={() => setResult(null)} style={{ marginTop: 16 }}>Neue Einschätzung</button>
      </main>
    );
  }

  if (result === "no") {
    return (
      <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>Ergebnis: Momentan eher nicht</h1>
        <p>Basierend auf Ihrer Eingabe ist ein positiver Solar-Fit aktuell unwahrscheinlich.</p>
        <button onClick={() => setResult(null)} style={{ marginTop: 16 }}>Neue Einschätzung</button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: 8 }}>Schnell-Check Solaranlage</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Beantworten Sie die 5 Pflichtfragen. Optional können Sie Kontaktdaten angeben.
      </p>

      {errors.length > 0 && (
        <div role="alert" style={{ background: "#fee", border: "1px solid #f99", padding: 12, marginBottom: 16 }}>
          <strong>Bitte korrigieren:</strong>
          <ul>{errors.map((e, i) => (<li key={i}>{e}</li>))}</ul>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <fieldset style={{ marginBottom: 16 }}>
          <legend><strong>1. Immobilientyp *</strong></legend>
          {PropertyType.map((p) => (
            <label key={p} style={{ display: "block", marginTop: 6 }}>
              <input type="radio" name="propertyType" value={p} required /> {p}
            </label>
          ))}
        </fieldset>

        <fieldset style={{ marginBottom: 16 }}>
          <legend><strong>2. Dachausrichtung (Mehrfachauswahl) *</strong></legend>
          {Orientations.map((o) => (
            <label key={o} style={{ display: "block", marginTop: 6 }}>
              <input type="checkbox" name="orientations" value={o} /> {o}
            </label>
          ))}
          <small style={{ color: "#666" }}>
            Hinweis: „Keine Angabe“ darf nicht mit anderen Optionen kombiniert werden.
          </small>
        </fieldset>

        <fieldset style={{ marginBottom: 16 }}>
          <legend><strong>3. Alter des Daches *</strong></legend>
          {RoofAge.map((r) => (
            <label key={r} style={{ display: "block", marginTop: 6 }}>
              <input type="radio" name="roofAge" value={r} required /> {r}
            </label>
          ))}
        </fieldset>

        <fieldset style={{ marginBottom: 16 }}>
          <legend><strong>4. Jahresstromverbrauch *</strong></legend>
          {Consumption.map((c) => (
            <label key={c} style={{ display: "block", marginTop: 6 }}>
              <input type="radio" name="annualConsumption" value={c} required /> {c}
            </label>
          ))}
        </fieldset>

        <fieldset style={{ marginBottom: 16 }}>
          <legend><strong>5. Interesse an weiteren Lösungen *</strong></legend>
          {OtherSolutions.map((o) => (
            <label key={o} style={{ display: "block", marginTop: 6 }}>
              <input type="radio" name="interestedInOtherSolutions" value={o} required /> {o}
            </label>
          ))}
        </fieldset>

        <fieldset style={{ marginBottom: 16 }}>
          <legend><strong>Optional: Kontakt</strong></legend>
          <div style={{ display: "grid", gap: 8 }}>
            <input name="name" placeholder="Name" />
            <input name="email" placeholder="E-Mail" />
            <input name="phone" placeholder="Telefon" />
          </div>
        </fieldset>

        <button type="submit" disabled={loading}>
          {loading ? "Sende..." : "Ergebnis anzeigen"}
        </button>
      </form>
    </main>
  );
}
