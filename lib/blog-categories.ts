export type BlogCategory = {
  slug: string;
  label: string;
  description: string;
};

export const blogCategories: BlogCategory[] = [
  {
    slug: "ai-safety",
    label: "AI Safety",
    description: "Risk controls, governance, and reliability boundaries.",
  },
  {
    slug: "cybersecurity",
    label: "Cybersecurity",
    description: "Security-first automation and resilient operating systems.",
  },
  {
    slug: "ai-healthcare",
    label: "AI In Healthcare",
    description: "Applied AI workflows for clinical and health operations.",
  },
  {
    slug: "ai-human-body-effects",
    label: "Effects Of AI On Human Body",
    description: "Research and practical considerations on human impact.",
  },
];

export function getCategoryBySlug(slug: string) {
  return blogCategories.find((category) => category.slug === slug);
}
