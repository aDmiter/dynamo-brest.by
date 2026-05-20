import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditManufacturerForm from './EditManufacturerForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditManufacturerPage({ params }: Props) {
  const { id } = await params;
  const manufacturer = await prisma.productmanufacturer.findUnique({ where: { id } });

  if (!manufacturer) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Редактирование производителя</h1>
      </div>
      <EditManufacturerForm manufacturer={manufacturer} />
    </div>
  );
}
