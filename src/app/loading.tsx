// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#242C41]">
      <div className="relative flex items-center justify-center">
        <img src="/images/spinner-1.png" alt="" className="h-72 w-auto" />
        <img
          src="/images/spinner-2.png"
          alt="Загрузка..."
          className="absolute h-72 w-auto"
          style={{ animation: 'spin 2s linear infinite' }}
        />
      </div>
    </div>
  );
}
