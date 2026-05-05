import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Prisma and logger before importing the route
vi.mock("@/lib/prisma", () => ({
  prisma: {
    domain: { findUnique: vi.fn() },
    user: { create: vi.fn() },
  },
}))
vi.mock("@/lib/logger", () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { POST } from "@/app/api/register/route"
import { prisma } from "@/lib/prisma"

const mockDomain = vi.mocked(prisma.domain.findUnique)
const mockCreate = vi.mocked(prisma.user.create)

function makeRequest(body: object) {
  return new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const validBody = {
  name: "Pilote Test",
  email: "test@nexora.io",
  password: "secret123",
  domainSlug: "javascript",
  answers: { experience: "Confirmé", language: "JS", presentation: "Motivé" },
}

describe("POST /api/register", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retourne 404 si le domaine est introuvable", async () => {
    mockDomain.mockResolvedValue(null)

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(404)
    expect(data.error).toMatch(/domaine/i)
  })

  it("retourne 201 et l'userId en cas de succès", async () => {
    mockDomain.mockResolvedValue({ id: "dom-1", slug: "javascript", label: "JavaScript" } as any)
    mockCreate.mockResolvedValue({
      id: "user-42",
      name: "Pilote Test",
      email: "test@nexora.io",
      progress: [],
    } as any)

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.userId).toBe("user-42")
    expect(data.message).toBeTruthy()
  })

  it("retourne 400 si l'email est déjà utilisé (Prisma P2002)", async () => {
    mockDomain.mockResolvedValue({ id: "dom-1", slug: "javascript", label: "JavaScript" } as any)
    const prismaError = Object.assign(new Error("Unique constraint"), { code: "P2002" })
    mockCreate.mockRejectedValue(prismaError)

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toMatch(/email/i)
  })

  it("retourne 500 en cas d'erreur système inattendue", async () => {
    mockDomain.mockResolvedValue({ id: "dom-1", slug: "javascript", label: "JavaScript" } as any)
    mockCreate.mockRejectedValue(new Error("DB connection lost"))

    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data.error).toBeTruthy()
  })
})
