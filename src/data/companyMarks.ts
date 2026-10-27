// Monochrome logos for experience entries, keyed by the lowercased `company`
// field. Files live in public/logos and are only ever used as CSS masks, so
// their own colours never show. `ratio` is the file's width / height.
// Wordmarks spell the company name themselves, so badges hide their text
// label next to one.

export interface CompanyMark {
  src: string;
  ratio: number;
  wordmark?: boolean;
}

const MARKS: Record<string, CompanyMark> = {
  octapulse: { src: "/logos/octapulse.png", ratio: 1 },
  "pioneer fund": { src: "/logos/pioneer.svg", ratio: 1 },
  "quaternion studios": { src: "/logos/quaternion.svg", ratio: 1 },
  asml: { src: "/logos/asml.svg", ratio: 1065 / 300, wordmark: true },
  "toyota motors north america": { src: "/logos/toyota.svg", ratio: 1 },
  toyota: { src: "/logos/toyota.svg", ratio: 1 },
  tesla: { src: "/logos/tesla.svg", ratio: 1 },
  nvidia: { src: "/logos/nvidia.svg", ratio: 1 },
};

export function companyMark(company: string): CompanyMark | undefined {
  return MARKS[company.toLowerCase()];
}
