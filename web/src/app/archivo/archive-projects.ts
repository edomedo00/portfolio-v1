export type ArchiveProject = {
  id: string;
  slug: string;
  title: string;
  image: string;
  imagePosition: string;
  kind: "image" | "video";
  detail: {
    title: string;
    paragraphs: string[];
    visitUrl: string;
    codeUrl: string;
    gallery: Array<{
      src: string;
      alt: string;
      objectPosition?: string;
    }>;
  };
};

const asciiFlowersDetail: ArchiveProject["detail"] = {
  title: "ASCII FLOWERS",
  visitUrl: "https://github.com/edomedo00/portfolio-v1",
  codeUrl: "https://github.com/edomedo00/portfolio-v1",
  paragraphs: [
    "THIS IS AN EXPANSION ON THE UNDERSTANDING OF FLOWERS AS CARRIERS OF BEAUTY. CHARACTERS AND SYMBOLS CARRY BEAUTY AS POTENTIAL EXPRESSORS OF CONCEPTS AND HOLDERS OF ALL POSSIBILITIES. WHITHIN THOSE COUNTLESS WAYS OF UNFOLDING LIES THE FIGURE OF A FOWER.",
    "THIS PROJECT WAS BUILT WITH THAT ON MIND. IT BUILDS FLOWER FIGURES USING ONLY TEXT CHARACTERS THROUGH A PROCEDURAL ALGORITHM, RESULTING IN A BEAUTIFUL TEXT GARDEN.",
  ],
  gallery: [
    {
      src: "/projects/kaomaxi/hero.png",
      alt: "Vista amplia del jardín ASCII",
    },
    {
      src: "/projects/kaomaxi/preview.png",
      alt: "Segunda vista del jardín ASCII",
    },
  ],
};

export const archiveProjects: ArchiveProject[] = [
  {
    id: "001",
    slug: "ascii-flowers",
    title: "ASCII GARDEN",
    image: "/projects/kaomaxi/preview.png",
    imagePosition: "left center",
    kind: "image",
    detail: asciiFlowersDetail,
  },
  {
    id: "002",
    slug: "ascii-flowers-002",
    title: "ASCII GARDEN",
    image: "/projects/kaomaxi/hero.png",
    imagePosition: "45% center",
    kind: "video",
    detail: asciiFlowersDetail,
  },
  {
    id: "004",
    slug: "ascii-flowers-004",
    title: "ASCII GARDEN",
    image: "/projects/kaomaxi/hero.png",
    imagePosition: "75% center",
    kind: "video",
    detail: asciiFlowersDetail,
  },
  {
    id: "001",
    slug: "ascii-flowers-archive",
    title: "ASCII GARDEN",
    image: "/projects/kaomaxi/preview.png",
    imagePosition: "left center",
    kind: "image",
    detail: asciiFlowersDetail,
  },
];

export function getArchiveProject(slug: string) {
  return archiveProjects.find((project) => project.slug === slug);
}

export function getNextArchiveId() {
  const highestProjectId = Math.max(
    0,
    ...archiveProjects.map((project) => Number.parseInt(project.id, 10) || 0),
  );

  return String(highestProjectId + 1).padStart(3, "0");
}
