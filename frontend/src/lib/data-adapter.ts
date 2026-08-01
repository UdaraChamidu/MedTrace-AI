import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { demoRecord, starterPatients } from "./demo-data";
import type { Patient, PatientRecord } from "../types";

export interface MedTraceAdapter {
  mode: "demo" | "supabase";
  listPatients(): Promise<Patient[]>;
  getPatientRecord(patientId: string): Promise<PatientRecord | null>;
  createPatient(input: Pick<Patient, "name" | "birthYear">): Promise<Patient>;
}

const wait = (duration = 280) => new Promise((resolve) => window.setTimeout(resolve, duration));

function readLocalPatients() {
  try {
    const raw = window.localStorage.getItem("medtrace-patients");
    return raw ? (JSON.parse(raw) as Patient[]) : starterPatients;
  } catch {
    return starterPatients;
  }
}

export class DemoAdapter implements MedTraceAdapter {
  mode = "demo" as const;

  async listPatients() {
    await wait();
    return readLocalPatients();
  }

  async getPatientRecord(patientId: string) {
    await wait(180);
    if (patientId === demoRecord.patient.id) return demoRecord;
    const patient = readLocalPatients().find((item) => item.id === patientId);
    if (!patient) return null;
    return { ...demoRecord, patient, findings: [], events: [], medications: [], labs: [] };
  }

  async createPatient(input: Pick<Patient, "name" | "birthYear">) {
    await wait(260);
    const patient: Patient = {
      id: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: input.name,
      initials: input.name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      birthYear: input.birthYear,
      recordLabel: "Personal workspace",
      lastUpdated: "Just now",
      documentCount: 0,
      findingCount: 0,
      status: "Ready",
    };
    const patients = [patient, ...readLocalPatients()];
    window.localStorage.setItem("medtrace-patients", JSON.stringify(patients));
    return patient;
  }
}

export class SupabaseAdapter implements MedTraceAdapter {
  mode = "supabase" as const;

  constructor(private readonly client: SupabaseClient) {}

  async listPatients(): Promise<Patient[]> {
    const { data, error } = await this.client
      .from("patients")
      .select("id, display_label, birth_year, updated_at, status");
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.display_label as string,
      initials: (row.display_label as string)
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      birthYear: row.birth_year as number,
      recordLabel: "Secure patient workspace",
      lastUpdated: new Date(row.updated_at as string).toLocaleString(),
      documentCount: 0,
      findingCount: 0,
      status: row.status === "processing" ? "Processing" : "Ready",
    }));
  }

  async getPatientRecord(patientId: string) {
    const { data, error } = await this.client
      .from("patients")
      .select("id, display_label, birth_year, updated_at, status")
      .eq("id", patientId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const patient = (await this.listPatients()).find((item) => item.id === patientId);
    return patient ? { ...demoRecord, patient } : null;
  }

  async createPatient(input: Pick<Patient, "name" | "birthYear">) {
    const { data, error } = await this.client
      .from("patients")
      .insert({ display_label: input.name, birth_year: input.birthYear })
      .select("id")
      .single();
    if (error) throw error;
    const patients = await this.listPatients();
    const created = patients.find((item) => item.id === data.id);
    if (!created) throw new Error("Patient was created but could not be loaded.");
    return created;
  }
}

export function createDataAdapter(): MedTraceAdapter {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const dataMode = import.meta.env.VITE_DATA_MODE ?? "demo";
  if (dataMode === "supabase" && url && key) return new SupabaseAdapter(createClient(url, key));
  return new DemoAdapter();
}

export const dataAdapter = createDataAdapter();
