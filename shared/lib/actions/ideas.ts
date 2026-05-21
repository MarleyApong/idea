"use server"

import { auth } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { revalidatePath } from "next/cache"
import { IdeaType } from "@prisma/client"

export type IdeaFormState = {
  success?: boolean
  error?: string
} | null

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
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : []
  const typeRaw = (formData.get("type") as string) || "PROJET"
  const type = Object.values(IdeaType).includes(typeRaw as IdeaType)
    ? (typeRaw as IdeaType)
    : IdeaType.PROJET

  await prisma.idea.create({
    data: {
      title,
      description,
      tags,
      type,
      userId: session.user.id,
    },
  })

  revalidatePath(`/${locale}/ideas`)
  return { success: true }
}
