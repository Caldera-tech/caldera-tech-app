import { describe, it, expect } from "vitest"

// Fonctions utilitaires pures extraites du projet
function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Une erreur inconnue est survenue."
}

function isPrismaUniqueError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  )
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

describe("getErrorMessage", () => {
  it("retourne le message d'une instance d'Error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom")
  })

  it("retourne un message générique pour une valeur non-Error", () => {
    expect(getErrorMessage("chaîne")).toBe("Une erreur inconnue est survenue.")
    expect(getErrorMessage(null)).toBe("Une erreur inconnue est survenue.")
    expect(getErrorMessage(42)).toBe("Une erreur inconnue est survenue.")
  })
})

describe("isPrismaUniqueError", () => {
  it("retourne true pour une erreur avec code P2002", () => {
    expect(isPrismaUniqueError({ code: "P2002" })).toBe(true)
  })

  it("retourne false pour d'autres codes d'erreur", () => {
    expect(isPrismaUniqueError({ code: "P2003" })).toBe(false)
  })

  it("retourne false pour une valeur nulle ou non-objet", () => {
    expect(isPrismaUniqueError(null)).toBe(false)
    expect(isPrismaUniqueError("P2002")).toBe(false)
    expect(isPrismaUniqueError(undefined)).toBe(false)
  })
})

describe("isValidEmail", () => {
  it("accepte les adresses email valides", () => {
    expect(isValidEmail("pilote@nexora.io")).toBe(true)
    expect(isValidEmail("user.name+tag@domain.co")).toBe(true)
  })

  it("rejette les adresses email invalides", () => {
    expect(isValidEmail("pas-un-email")).toBe(false)
    expect(isValidEmail("@nexora.io")).toBe(false)
    expect(isValidEmail("pilote@")).toBe(false)
    expect(isValidEmail("")).toBe(false)
  })
})
