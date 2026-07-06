import { defineCollection, z } from "astro:content";

const pagesCollection = defineCollection({
  type: "data",
  schema: z.object({
    template: z.literal("pages"),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    hero: z.object({
      headline: z.string(),
      description: z.string(),
    }),
    sections: z.array(z.any()),
  }),
});

export const collections = {
  pages: pagesCollection,
};
