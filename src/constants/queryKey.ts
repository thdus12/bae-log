export const queryKey = {
  scheme: () => ["scheme"],
  cursorFx: () => ["cursorFx"],
  posts: () => ["posts"],
  tags: () => ["tags"],
  categories: () => ["categories"],
  post: (slug: string) => ["post", slug],
}
