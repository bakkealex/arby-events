"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function addGroup(form: { name: string; description?: string }) {
  await requireRole(UserRole.ADMIN);

  // Get the current admin's user ID from the session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Could not determine admin user ID.");
  }

  await prisma.group.create({
    data: {
      name: form.name,
      description: form.description,
      createdBy: session.user.id,
    },
  });
  revalidatePath("/admin/groups");
}

export async function editGroup(form: {
  id: string;
  name: string;
  description?: string;
}) {
  await requireRole(UserRole.ADMIN);
  await prisma.group.update({
    where: { id: form.id },
    data: {
      name: form.name,
      description: form.description,
    },
  });
  revalidatePath("/admin/groups");
}
