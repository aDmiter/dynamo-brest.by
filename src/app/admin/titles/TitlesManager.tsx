// src/app/admin/titles/TitlesManager.tsx - Управление титулами
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faImage } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/modules/admin/components/ImageUpload';

interface Title {
  id: string;
  name: string;
  year: number;
  type: string;
  imageUrl?: string | null;
}

interface TitlesManagerProps {
  titles: Title[];
}

const DEFAULT_IMAGES: Record<string, string> = {
  championship: '/images/cup3.png',
  cup: '/images/cup2.png',
  supercup: '/images/cup1.png',
};

const TITLE_CONFIG = [
  {
    type: 'championship',
    name: 'Чемпионат',
    image: '/images/cup3.png',
    description: 'Чемпион Беларуси',
    color: 'from-[#FFD700] to-[#FFA500]',
    textColor: 'text-[#FFD700]',
  },
  {
    type: 'cup',
    name: 'Кубок',
    image: '/images/cup2.png',
    description: 'Кубок Беларуси',
    color: 'from-[#C0C0C0] to-[#808080]',
    textColor: 'text-[#C0C0C0]',
  },
  {
    type: 'supercup',
    name: 'Суперкубок',
    image: '/images/cup1.png',
    description: 'Суперкубок Беларуси',
    color: 'from-[#CD7F32] to-[#8B4513]',
    textColor: 'text-[#CD7F32]',
  },
];

export default function TitlesManager({ titles }: TitlesManagerProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  // Храним кастомные картинки для каждого типа
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  const openAddModal = (type: string, name: string) => {
    setCurrentType(type);
    setCurrentName(name);
    setYear(new Date().getFullYear());
    setModalOpen(true);
  };

  const openImageModal = (type: string, name: string, currentImg: string) => {
    setCurrentType(type);
    setCurrentName(name);
    setCurrentImage(currentImg);
    setImageModalOpen(true);
  };

  const handleAddYear = async () => {
    setLoading(true);
    try {
      await fetch('/api/titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentName,
          year,
          type: currentType,
          imageUrl: customImages[currentType] || DEFAULT_IMAGES[currentType],
        }),
      });
      router.refresh();
      setModalOpen(false);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveImage = async () => {
    setLoading(true);
    try {
      // Обновляем все существующие титулы этого типа с новой картинкой
      const items = titles.filter((t) => t.type === currentType);
      for (const item of items) {
        await fetch(`/api/titles/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: currentImage }),
        });
      }
      setCustomImages({ ...customImages, [currentType]: currentImage });
      router.refresh();
      setImageModalOpen(false);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async (id: string) => {
    if (!confirm('Удалить этот год?')) return;
    try {
      await fetch(`/api/titles/${id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  // Обновим API для PUT
  const updateTitle = async (id: string, data: Record<string, unknown>) => {
    try {
      await fetch(`/api/titles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      router.refresh();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {TITLE_CONFIG.map((config) => {
          const items = titles.filter((t) => t.type === config.type);
          const count = items.length;
          const displayImage = customImages[config.type] || config.image;

          return (
            <div
              key={config.type}
              className="border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
            >
              {/* Кубок и название */}
              <div className="relative flex flex-col items-center p-8">
                <div className={`absolute inset-0 bg-gradient-to-b ${config.color} opacity-5`} />

                <div className="relative mb-4 w-32 transition-transform hover:scale-110 group">
                  <img src={displayImage} alt={config.name} className="w-full drop-shadow-2xl" />
                  <button
                    onClick={() => openImageModal(config.type, config.name, displayImage)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-xs text-white flex items-center gap-1">
                      <FontAwesomeIcon icon={faImage} /> Сменить
                    </span>
                  </button>
                </div>

                <h2
                  className="text-xl font-bold text-white text-center"
                  style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                >
                  {config.name}
                </h2>
                <p className="text-sm text-gray-400 mt-1">{config.description}</p>

                <div className="mt-4 text-center">
                  <span
                    className="text-5xl font-black text-[#ee862c]"
                    style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                  >
                    {count}
                  </span>
                </div>
              </div>

              {/* Список годов */}
              <div className="border-t border-white/10 p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-500 w-full text-center py-2">Нет записей</p>
                  ) : (
                    items
                      .sort((a, b) => b.year - a.year)
                      .map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white group"
                        >
                          {item.year}
                          <button
                            onClick={() => handleDeleteYear(item.id)}
                            className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                          </button>
                        </span>
                      ))
                  )}
                </div>

                <Button
                  onClick={() => openAddModal(config.type, config.name)}
                  size="sm"
                  variant="outline"
                  className="w-full border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" /> Добавить год
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Модальное окно добавления года */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm border border-white/10 bg-[#242C41]/90 backdrop-blur-xl p-8 shadow-2xl">
            <h3 className="font-heading text-xl font-bold text-white mb-6 text-center">
              {currentName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Год</label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  className="border-white/10 bg-white/5 text-white text-center text-2xl"
                  min="1960"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddYear}
                  disabled={loading}
                  className="flex-1 bg-[#ee862c] hover:bg-[#f0ac74]"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  {loading ? '...' : 'Добавить'}
                </Button>
                <Button
                  onClick={() => setModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-white/10 text-gray-400 hover:text-white"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно смены картинки */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setImageModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md border border-white/10 bg-[#242C41]/90 backdrop-blur-xl p-8 shadow-2xl">
            <h3 className="font-heading text-xl font-bold text-white mb-6 text-center">
              Картинка — {currentName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Текущая картинка</label>
                <img
                  src={currentImage}
                  alt={currentName}
                  className="h-24 w-auto mx-auto object-contain mb-4"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Новая картинка</label>
                <ImageUpload value={currentImage} onChange={(url) => setCurrentImage(url)} />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveImage}
                  disabled={loading}
                  className="flex-1 bg-[#ee862c] hover:bg-[#f0ac74]"
                >
                  {loading ? '...' : 'Сохранить'}
                </Button>
                <Button
                  onClick={() => setImageModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-white/10 text-gray-400 hover:text-white"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
