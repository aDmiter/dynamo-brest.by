// src/app/page.tsx - Главная страница
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol, faCalendarDays, faTrophy, faShirt } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Слайдер новостей (место под будущий компонент) */}
      <section className="mb-10 overflow-hidden rounded-xl bg-gray-200">
        <div className="flex h-[350px] items-center justify-center text-gray-500 md:h-[450px]">
          <p className="text-xl">Здесь будет слайдер избранных новостей</p>
        </div>
      </section>

      {/* Модули: следующий матч + прошлый матч */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-xl bg-[#003366] p-6 text-white">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
            <FontAwesomeIcon icon={faCalendarDays} />
            Следующий матч
          </h2>
          <div className="flex h-[120px] items-center justify-center rounded-lg bg-white/10">
            <p>Здесь будет информация о следующем матче</p>
          </div>
        </section>

        <section className="rounded-xl bg-gray-100 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-[#003366]">
            <FontAwesomeIcon icon={faCalendarDays} />
            Прошлый матч
          </h2>
          <div className="flex h-[120px] items-center justify-center rounded-lg bg-gray-200">
            <p className="text-gray-500">Здесь будет информация о прошлом матче</p>
          </div>
        </section>
      </div>

      {/* Рекламный баннер */}
      <section className="mb-10">
        <div className="flex h-[120px] items-center justify-center rounded-xl bg-yellow-100">
          <p className="text-gray-600">Рекламный баннер (с подсчётом кликов)</p>
        </div>
      </section>

      {/* Последние видео + Титулы */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-xl bg-gray-100 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-[#003366]">
            <FontAwesomeIcon icon={faTrophy} />
            Последние видео
          </h2>
          <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-200">
            <p className="text-gray-500">YouTube видео</p>
          </div>
        </section>

        <section className="rounded-xl bg-gray-100 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-[#003366]">
            <FontAwesomeIcon icon={faTrophy} />
            Титулы клуба
          </h2>
          <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-200">
            <p className="text-gray-500">Титулы и достижения</p>
          </div>
        </section>
      </div>

      {/* Избранные товары магазина */}
      <section className="mb-10 rounded-xl bg-gray-100 p-6">
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-[#003366]">
          <FontAwesomeIcon icon={faShirt} />
          Товары магазина
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex h-[200px] items-center justify-center rounded-lg bg-white shadow"
            >
              <p className="text-sm text-gray-400">Товар {item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
