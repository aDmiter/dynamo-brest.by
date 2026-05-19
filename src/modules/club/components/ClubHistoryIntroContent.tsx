import type { PublicClubHistoryIntro } from '@/lib/club-history-types';

type Props = {
  intro: PublicClubHistoryIntro;
};

export default function ClubHistoryIntroContent({ intro }: Props) {
  return (
    <>
      {intro.coverUrl ? (
        <figure className="club-history-content__figure club-history-content__figure--intro-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={intro.coverUrl}
            alt=""
            className="club-history-content__image"
            loading="lazy"
          />
        </figure>
      ) : null}
      {intro.contentHtml ? (
        <div
          className="club-history-content__html"
          dangerouslySetInnerHTML={{ __html: intro.contentHtml }}
        />
      ) : null}
    </>
  );
}
