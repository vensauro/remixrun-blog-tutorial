import { prisma } from "~/db.server";

import { Post } from "@prisma/client";
export type { Post } from "@prisma/client";

export async function getPosts() {
  return prisma.post.findMany();
}

export async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function createPost(
  post: Pick<Post, "slug" | "title" | "markdown">
) {
  return prisma.post.create({ data: post });
}

export async function updatePost(
  post: Pick<Post, "slug" | "title" | "markdown"> & { id: string }
) {
  return prisma.post.update({
    where: { slug: post.id },
    data: { title: post.title, markdown: post.markdown, slug: post.slug },
  });
}

export async function deletePost(postSlug: string) {
  return prisma.post.delete({
    where: { slug: postSlug },
  });
}
