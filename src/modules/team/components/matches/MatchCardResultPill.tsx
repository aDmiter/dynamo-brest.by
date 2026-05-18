type ResultCode = 'W' | 'D' | 'L';

const RESULT_LABEL: Record<ResultCode, string> = {
  W: 'ПОБЕДА',
  D: 'НИЧЬЯ',
  L: 'ПОРАЖЕНИЕ',
};

interface Props {
  result: ResultCode;
}

export default function MatchCardResultPill({ result }: Props) {
  return (
    <div className="results__card-result-aside" aria-label={`Итог: ${RESULT_LABEL[result]}`}>
      <span className="results__card-result-pill" data-result={result}>
        {RESULT_LABEL[result]}
      </span>
    </div>
  );
}
