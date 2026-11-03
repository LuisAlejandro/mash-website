export type PublicPost = {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

/** A post without its body, for lists and feeds. */
export type PublicPostSummary = Omit<PublicPost, "body">;
