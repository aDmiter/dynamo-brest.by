import type { PublicClubHistoryYear } from '@/lib/club-history-types';

type Props = {
  entry: PublicClubHistoryYear;
};

export default function ClubHistoryYearContent({ entry }: Props) {
  return (
    <>
      {entry.contentHtml ? (
        <div
          className="club-history-content__html"
          dangerouslySetInnerHTML={{ __html: entry.contentHtml }}
        />
      ) : null}
      {entry.gallery.map((img, index) => (
        <figure key={`${img.url}-${index}`} className="club-history-content__figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.alt || ''}
            className="club-history-content__image"
            loading="lazy"
            decoding="async"
          />
        </figure>
      ))}
    </>
  );
}
