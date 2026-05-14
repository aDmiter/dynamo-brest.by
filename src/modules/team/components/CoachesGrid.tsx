// src/modules/team/components/CoachesGrid.tsx - Сетка тренеров и персонала
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

const typeLabels: Record<string, string> = {
  coach: 'Тренерский штаб',
  staff: 'Персонал',
};

export default function CoachesGrid({ coaches }: Props) {
  const groupedCoaches: Record<string, CoachData[]> = {};

  for (const coach of coaches) {
    const type = coach.type || 'coach';
    if (!groupedCoaches[type]) {
      groupedCoaches[type] = [];
    }
    groupedCoaches[type].push(coach);
  }

  const typeOrder = ['coach', 'staff'];

  return (
    <div className="py-16">
      <div className="mx-auto w-full pl-20 pr-4 md:pl-28">
        {coaches.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-gray-500">Информация о тренерском штабе скоро появится</p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {typeOrder.map((type) => {
              const coachesOfType = groupedCoaches[type];
              if (!coachesOfType || coachesOfType.length === 0) return null;

              return (
                <div key={type}>
                  <h2
                    className="mb-6 text-2xl font-black uppercase tracking-wider text-white"
                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                  >
                    {typeLabels[type] || type}
                  </h2>

                  <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-px bg-white/5">
                    {coachesOfType.map((coach) => (
                      <CoachCard key={coach.id} coach={coach} />
                    ))}
                  </div>
                </div>
              );
            })}
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
