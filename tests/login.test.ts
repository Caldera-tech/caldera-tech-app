import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}))
vi.mock("@/lib/logger", () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
// bcrypt est mocké pour contrôler la comparaison de mot de passe
vi.mock("bcrypt", () => ({
  default: { compare: vi.fn() },
  compare: vi.fn(),
}))

import { POST } from "@/app/api/login/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

const mockFindUser = vi.mocked(prisma.user.findUnique)
const mockCompare = vi.mocked(bcrypt.compare)

function makeRequest(body: object) {
  return new Request("http://localhost/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const fakeUser = {
  id: "user-1",
  name: "Pilote Alpha",
  email: "alpha@nexora.io",
  password: "$2b$10$hashedpassword",
  role: "USER",
}

describe("POST /api/login", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retourne 401 si l'email est inconnu", async () => {
    mockFindUser.mockResolvedValue(null)

    const res = await POST(makeRequest({ email: "ghost@nexora.io", password: "any" }))
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBeTruthy()
  })

  it("retourne 401 si le mot de passe est invalide", async () => {
    mockFindUser.mockResolvedValue(fakeUser as any)
    mockCompare.mockResolvedValue(false as never)

    const res = await POST(makeRequest({ email: fakeUser.email, password: "mauvais" }))
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBeTruthy()
  })

  it("retourne 200 avec les infos utilisateur si les credentials sont valides", async () => {
    mockFindUser.mockResolvedValue(fakeUser as any)
    mockCompare.mockResolvedValue(true as never)

    const res = await POST(makeRequest({ email: fakeUser.email, password: "correct" }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.user.id).toBe("user-1")
    expect(data.user.email).toBe(fakeUser.email)
    // Le mot de passe ne doit jamais être exposé dans la réponse
    expect(data.user.password).toBeUndefined()
  })
})
