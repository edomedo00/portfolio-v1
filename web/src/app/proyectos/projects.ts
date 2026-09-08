export type Project = {
  slug: string;
  title: string;
  meta: string;
  description: string;
  preview: {
    src: string;
    alt: string;
    kind: "kaomaxi-crop" | "placeholder";
  };
};

export const projects: Project[] = [
  {
    slug: "kaomaxi",
    title: "KAOMAXI",
    meta: "DISEÑO / DESARROLLO / 2026",
    description: "SITIO WEB",
    preview: {
      src: "/projects/kaomaxi/preview.png",
      alt: "Vista previa del proyecto Kaomaxi",
      kind: "kaomaxi-crop",
    },
  },
  {
    slug: "studio-test",
    title: "STUDIO TEST",
    meta: "DESARROLLO / 2026",
    description: "PLAYGROUND INTERACTIVO",
    preview: {
      src: "/projects/placeholders/studio-test.svg",
      alt: "Imagen pendiente para Studio Test",
      kind: "placeholder",
    },
  },
  {
    slug: "periques",
    title: "PERIQUES",
    meta: "DESARROLLO / DISEÑO / 2026",
    description: "SITIO WEB",
    preview: {
      src: "/projects/placeholders/periques.svg",
      alt: "Imagen pendiente para Periques",
      kind: "placeholder",
    },
  },
  {
    slug: "paulo-ramirez",
    title: "PAULO RAMIREZ",
    meta: "DESARROLLO / DISEÑO / 2026",
    description: "PORTAFOLIO",
    preview: {
      src: "/projects/placeholders/paulo-ramirez.svg",
      alt: "Imagen pendiente para Paulo Ramirez",
      kind: "placeholder",
    },
  },
  {
    slug: "proyecto-05",
    title: "PROYECTO 05",
    meta: "DISEÑO / DESARROLLO / 2026",
    description: "SITIO WEB",
    preview: {
      src: "/projects/placeholders/proyecto-05.svg",
      alt: "Imagen pendiente para Proyecto 05",
      kind: "placeholder",
    },
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
