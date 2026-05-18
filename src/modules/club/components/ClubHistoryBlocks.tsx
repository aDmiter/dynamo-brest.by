import type { ClubHistoryBlock } from '@/config/club-history';

type Props = {
  blocks: ClubHistoryBlock[];
  idPrefix: string;
};

export default function ClubHistoryBlocks({ blocks, idPrefix }: Props) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${idPrefix}-${index}`;

        if (block.type === 'text') {
          const isHeading =
            block.text.startsWith('Все голы') ||
            block.text.startsWith('Состав') ||
            block.text.startsWith('Итоговая статистика');
          return (
            <p
              key={key}
              className={
                isHeading
                  ? 'club-history-content__paragraph club-history-content__paragraph--heading'
                  : 'club-history-content__paragraph'
              }
            >
              {block.text}
            </p>
          );
        }

        if (block.type === 'image') {
          return (
            <figure key={key} className="club-history-content__figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.src}
                alt={block.alt || ''}
                className="club-history-content__image"
                loading="lazy"
                decoding="async"
              />
            </figure>
          );
        }

        return (
          <div key={key} className="club-history-content__video">
            <div className="club-history-content__video-inner">
              <iframe
                src={`https://www.youtube.com/embed/${block.videoId}`}
                title={block.title || 'Видео'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
            {block.title ? (
              <p className="club-history-content__video-caption">{block.title}</p>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
