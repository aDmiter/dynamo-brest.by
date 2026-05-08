// src/modules/shared/ui/PagePlaceholder.tsx - Заглушка для будущих страниц
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface PagePlaceholderProps {
  title: string;
  description?: string;
  icon?: IconDefinition;
}

export default function PagePlaceholder({ title, description, icon }: PagePlaceholderProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        {icon && (
          <div className="mb-4 text-5xl text-[#003366]">
            <FontAwesomeIcon icon={icon} />
          </div>
        )}
        <h1 className="mb-4 text-3xl font-bold text-[#003366]">{title}</h1>
        {description && <p className="max-w-md text-gray-600">{description}</p>}
        <div className="mt-8 h-[300px] w-full max-w-2xl rounded-xl bg-gray-100 flex items-center justify-center">
          <p className="text-gray-400">Контент страницы будет добавлен позже</p>
        </div>
      </div>
    </div>
  );
}
