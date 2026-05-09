'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default function DeleteSponsorButton({
  sponsorId,
  sponsorName,
}: {
  sponsorId: string;
  sponsorName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Удалить "${sponsorName}"?`)) return;
    setLoading(true);
    await fetch(`/api/sponsors/${sponsorId}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-400 hover:text-red-300 text-sm"
    >
      <FontAwesomeIcon icon={faTrash} /> Уд.
    </button>
  );
}
