export const queryKey = {
  scheme: () => ["scheme"],
  cursorFx: () => ["cursorFx"],
  palette: () => ["palette"],
  posts: () => ["posts"],
  tags: () => ["tags"],
  categories: () => ["categories"],
  post: (slug: string) => ["post", slug],
}
