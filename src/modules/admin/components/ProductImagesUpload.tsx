'use client';

import ImageUpload from '@/modules/admin/components/ImageUpload';

interface ProductImagesUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ProductImagesUpload({ images, onChange }: ProductImagesUploadProps) {
  const addImage = (url: string) => {
    if (!url) return;
    onChange([...images, url]);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <p className="mb-2 text-xs text-gray-500">
        Первое фото — обложка в каталоге. Остальные отображаются в галерее карточки товара.
      </p>

      {images.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={`${img}-${i}`} className="relative">
              {i === 0 ? (
                <span className="absolute -top-2 left-1 z-10 bg-[#ee862c] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  Обложка
                </span>
              ) : null}
              <img src={img} alt="" className="h-24 w-24 border border-white/10 object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center bg-red-500 text-xs text-white hover:bg-red-600"
                title="Удалить"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-sm text-gray-500">Фотографии не добавлены</p>
      )}

      <ImageUpload
        value=""
        onChange={addImage}
        folder="products"
        addLabel="Добавить фото"
        showPlaceholder={false}
      />
    </div>
  );
}
