// src/modules/team/components/CoachesGrid.tsx - Сетка тренерского штаба
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface CoachData {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  position: string | null;
  photoUrl: string | null;
  birthDate: Date | null;
  nationality: string | null;
  type: string;
}

interface Props {
  coaches: CoachData[];
}

// Порядок сортировки должностей
const positionOrder: Record<string, number> = {
  'Главный тренер': 1,
  'Старший тренер': 2,
  Тренер: 3,
  'Тренер молодеж.команды': 4,
};

function getPositionSort(position: string | null): number {
  if (!position) return 99;
  // Ищем точное совпадение
  if (positionOrder[position] !== undefined) return positionOrder[position];
  // Если начинается с "Тренер" — после обычных тренеров
  if (position.startsWith('Тренер')) return 10;
  // Всё остальное (персонал) — после тренеров
  return 50;
}

export default function CoachesGrid({ coaches }: Props) {
  // Сортируем: сначала по должности, потом по фамилии
  const sortedCoaches = [...coaches].sort((a, b) => {
    const posA = getPositionSort(a.position);
    const posB = getPositionSort(b.position);
    if (posA !== posB) return posA - posB;
    return (a.lastName || '').localeCompare(b.lastName || '');
  });

  return (
    <div className="py-16">
      <div className="mx-auto w-full pl-20 pr-4 md:pl-28">
        {sortedCoaches.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-gray-500">Информация о тренерском штабе скоро появится</p>
          </div>
        ) : (
          <div>
            <h2
              className="mb-6 text-2xl font-black uppercase tracking-wider text-white"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              Тренерский штаб
            </h2>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-px bg-white/5">
              {sortedCoaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Карточка тренера
function CoachCard({ coach }: { coach: CoachData }) {
  return (
    <div className="coach-card group relative bg-[#0d1117] overflow-hidden transition-colors hover:bg-[#111827]">
      {/* Фото */}
      <div className="coach-card__photo relative w-full aspect-[3/4] overflow-hidden bg-[#1a1f2e]">
        {coach.photoUrl ? (
          <img
            src={coach.photoUrl}
            alt={`${coach.lastName} ${coach.firstName}`}
            className="coach-card__photo-image absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-6xl text-gray-600" />
          </div>
        )}

        {/* Градиент снизу */}
        <div className="coach-card__gradient absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1117] to-transparent" />
      </div>

      {/* Инфо */}
      <div className="coach-card__info p-4">
        <h3 className="coach-card__lastname text-2xl font-black uppercase text-white leading-tight">
          {coach.lastName}
        </h3>
        <p className="coach-card__firstname mt-0.5 text-sm text-gray-400">
          {coach.firstName}
          {coach.middleName && ` ${coach.middleName}`}
        </p>
        {coach.position && (
          <p className="coach-card__position mt-1 text-sm text-[#ee862c]">{coach.position}</p>
        )}

        <div className="coach-card__details mt-3 flex flex-wrap gap-1.5">
          {coach.nationality && (
            <span className="border border-white/10 px-2 py-0.5 text-[11px] text-gray-500">
              {coach.nationality}
            </span>
          )}
          {coach.birthDate && (
            <span className="border border-white/10 px-2 py-0.5 text-[11px] text-gray-500">
              {new Date(coach.birthDate).toLocaleDateString('ru-RU')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
