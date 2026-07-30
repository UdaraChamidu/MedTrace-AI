import { describe, expect, it } from "vitest";
import {
  checkIdentityConsistency,
  type ExplicitPatientIdentity
} from "../src/identity.js";
import { assertPatientOwnership } from "../src/ownership.js";

const base: ExplicitPatientIdentity = {
  documentId: "doc-1",
  fullName: "Alex Perera",
  externalPatientId: "MRN-100",
  dateOfBirth: "2000-01-01",
  sex: "female",
  ageYears: 25,
  documentDate: "2025-06-01"
};

describe("identity consistency guard", () => {
  it("quarantines conflicting explicit identities", () => {
    const result = checkIdentityConsistency(base, {
      ...base,
      documentId: "doc-2",
      externalPatientId: "MRN-999",
      sex: "male"
    });
    expect(result.status).toBe("conflicting");
    expect(result.quarantine).toBe(true);
    expect(result.conflictingFields).toEqual(
      expect.arrayContaining(["externalPatientId", "sex"])
    );
  });

  it("quarantines documents with no shared explicit identity evidence", () => {
    const result = checkIdentityConsistency(
      { ...base, fullName: null, externalPatientId: null, dateOfBirth: null, sex: null, ageYears: null },
      {
        ...base,
        documentId: "doc-2",
        fullName: null,
        externalPatientId: null,
        dateOfBirth: null,
        sex: null,
        ageYears: null
      }
    );
    expect(result.status).toBe("insufficient");
    expect(result.quarantine).toBe(true);
  });
});

describe("patient ownership check", () => {
  it("rejects patients outside the owned set without revealing existence", () => {
    expect(() => assertPatientOwnership("patient-b", ["patient-a"])).toThrow(
      "Patient not found or access denied."
    );
    expect(() => assertPatientOwnership("patient-a", ["patient-a"])).not.toThrow();
  });
});
