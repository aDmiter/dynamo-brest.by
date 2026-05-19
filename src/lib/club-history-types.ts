export type ClubHistoryGalleryImage = {
  url: string;
  alt: string;
};

export type PublicClubHistoryYear = {
  id: string;
  label: string;
  year: number;
  highlight?: boolean;
  teaser: string;
  contentHtml: string;
  coverUrl: string | null;
  gallery: ClubHistoryGalleryImage[];
};

export type PublicClubHistoryIntro = {
  contentHtml: string;
  coverUrl: string | null;
};

export type PublicClubHistory = {
  intro: PublicClubHistoryIntro;
  years: PublicClubHistoryYear[];
};

export type ClubHistoryYearImageInput = {
  id?: string;
  url: string;
  alt?: string;
  sortOrder: number;
};

export type ClubHistoryYearInput = {
  label: string;
  year: number;
  highlight?: boolean;
  contentHtml: string;
  isActive?: boolean;
  images: ClubHistoryYearImageInput[];
};
