"use server"

import { auth } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { revalidatePath } from "next/cache"
import { IdeaType, IdeaStatus } from "@prisma/client"
import { redirect } from "next/navigation"

export type IdeaFormState = {
  success?: boolean
  error?: string
} | null

function parseType(raw: string | null): IdeaType {
  return Object.values(IdeaType).includes(raw as IdeaType)
    ? (raw as IdeaType)
    : IdeaType.PROJET
}

function parseStatus(raw: string | null): IdeaStatus {
  return Object.values(IdeaStatus).includes(raw as IdeaStatus)
    ? (raw as IdeaStatus)
    : IdeaStatus.DRAFT
}

export async function createIdea(
  locale: string,
  _prev: IdeaFormState,
  formData: FormData
): Promise<IdeaFormState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Non autorise" }

  const title = (formData.get("title") as string)?.trim()
  if (!title) return { error: "Le titre est requis" }

  const description = (formData.get("description") as string)?.trim() || null
  const tagsRaw = (formData.get("tags") as string)?.trim()
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []
  const type = parseType(formData.get("type") as string)

  await prisma.idea.create({
    data: { title, description, tags, type, userId: session.user.id },
  })

  revalidatePath(`/${locale}/ideas`)
  return { success: true }
}

export async function updateIdea(
  id: string,
  locale: string,
  _prev: IdeaFormState,
  formData: FormData
): Promise<IdeaFormState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Non autorise" }

  const idea = await prisma.idea.findUnique({ where: { id } })
  if (!idea || idea.userId !== session.user.id) return { error: "Non autorise" }

  const title = (formData.get("title") as string)?.trim()
  if (!title) return { error: "Le titre est requis" }

  const description = (formData.get("description") as string)?.trim() || null
  const tagsRaw = (formData.get("tags") as string)?.trim()
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []
  const type = parseType(formData.get("type") as string)
  const status = parseStatus(formData.get("status") as string)

  await prisma.idea.update({
    where: { id },
    data: { title, description, tags, type, status },
  })

  revalidatePath(`/${locale}/ideas`)
  revalidatePath(`/${locale}/ideas/${id}`)
  return { success: true }
}

export async function deleteIdea(id: string, locale: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.idea.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath(`/${locale}/ideas`)
  redirect(`/${locale}/ideas`)
}
