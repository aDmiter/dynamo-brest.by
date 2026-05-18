// src/app/shop/product/[slug]/ProductCustomization.tsx
'use client';

import { useState, useEffect } from 'react';
import { useProductPrice } from './ProductPrice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface Customization {
  id: string;
  name: string;
  type: string;
  price: string;
  imageUrl?: string | null;
}

interface Player {
  id: string;
  name: string;
  number: number;
}

interface ProductCustomizationProps {
  customizations: Customization[];
  players: Player[];
  basePrice: number;
}

export default function ProductCustomization({
  customizations,
  players,
  basePrice,
}: ProductCustomizationProps) {
  const [enabled, setEnabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<'full' | 'custom'>('full');
  const [playerId, setPlayerId] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedLogos, setSelectedLogos] = useState<string[]>([]);
  const [inputNumber, setInputNumber] = useState('');
  const [inputName, setInputName] = useState('');

  const { setExtraPrice } = useProductPrice();

  const toggleLogo = (id: string) => {
    setSelectedLogos((prev) => {
      if (prev.includes(id)) {
        const item = customizations.find((c) => c.id === id);
        if (item?.type === 'number') setInputNumber('');
        if (item?.type === 'name') setInputName('');
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  const fullSetItem = customizations.find((c) => c.type === 'fullset');
  const fullSetPrice = fullSetItem ? Number(fullSetItem.price) : 0;
  const customPrice = selectedLogos.reduce((sum, id) => {
    const item = customizations.find((c) => c.id === id);
    return sum + (item ? Number(item.price) : 0);
  }, 0);
  const extraPrice = enabled ? (type === 'full' ? fullSetPrice : customPrice) : 0;

  useEffect(() => {
    setExtraPrice(extraPrice);
  }, [extraPrice, setExtraPrice]);

  const logoItems = customizations.filter((c) => c.type !== 'fullset');
  const numberItem = selectedLogos.find(
    (id) => customizations.find((c) => c.id === id)?.type === 'number'
  );
  const nameItem = selectedLogos.find(
    (id) => customizations.find((c) => c.id === id)?.type === 'name'
  );
  const isNumberValid = !numberItem || inputNumber.trim().length > 0;
  const isNameValid = !nameItem || inputName.trim().length > 0;

  const applyCustomization = () => {
    const data = {
      type,
      fullSetPrice: type === 'full' ? fullSetPrice : 0,
      playerId,
      playerName: playerId ? players.find((p) => p.id === playerId)?.name || '' : '',
      playerNumber: playerId ? players.find((p) => p.id === playerId)?.number || 0 : 0,
      customNumber: type === 'full' ? customNumber : inputNumber,
      customName: type === 'full' ? customName : inputName,
      logos: selectedLogos.map((id) => {
        const item = customizations.find((c) => c.id === id);
        return {
          id,
          name: item?.name || '',
          type: item?.type || '',
          price: Number(item?.price || 0),
          imageUrl: item?.imageUrl || '',
        };
      }),
      extraPrice,
    };
    (window as unknown as Record<string, unknown>).__lastCustomization = data;
    setModalOpen(false);
  };

  return (
    <>
      <label className="mt-6 flex items-center justify-end gap-3 cursor-pointer">
        <span className="text-sm font-bold uppercase tracking-wider text-white">
          Нанесение{' '}
          {extraPrice > 0 && (
            <span style={{ color: 'var(--color-accent)' }}>(+{extraPrice.toFixed(2)} BYN)</span>
          )}
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            setEnabled(e.target.checked);
            if (e.target.checked) setModalOpen(true);
            else {
              setSelectedLogos([]);
              setInputNumber('');
              setInputName('');
              setCustomNumber('');
              setCustomName('');
              setPlayerId('');
              delete (window as unknown as Record<string, unknown>).__lastCustomization;
            }
          }}
          className="h-4 w-4"
          style={{ accentColor: 'var(--color-accent)' }}
        />
      </label>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setModalOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
            style={{
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-admin)',
              backdropFilter: 'blur(24px)',
              borderRadius: 16,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
              >
                Нанесение
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-stat)' }}>
                  Тип нанесения
                </p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="custType"
                      checked={type === 'full'}
                      onChange={() => setType('full')}
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                    <span className="text-sm text-white">
                      Полное{' '}
                      {fullSetPrice > 0 && (
                        <span style={{ color: 'var(--color-accent)' }}>
                          (+{fullSetPrice.toFixed(2)} BYN)
                        </span>
                      )}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="custType"
                      checked={type === 'custom'}
                      onChange={() => setType('custom')}
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                    <span className="text-sm text-white">Выбрать элементы</span>
                  </label>
                </div>
              </div>

              {type === 'full' && (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: 'var(--color-text-stat)' }}>
                    Выберите игрока или введите свои данные
                  </p>
                  <select
                    value={playerId}
                    onChange={(e) => {
                      setPlayerId(e.target.value);
                      if (e.target.value) {
                        const p = players.find((x) => x.id === e.target.value);
                        if (p) {
                          setCustomNumber(p.number.toString());
                          setCustomName(p.name);
                        }
                      } else {
                        setCustomNumber('');
                        setCustomName('');
                      }
                    }}
                    className="shop-select product-customization__select"
                  >
                    <option value="">— Выбрать игрока —</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-center" style={{ color: 'var(--color-text-label)' }}>
                    — или —
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="text-xs mb-1 block"
                        style={{ color: 'var(--color-text-label)' }}
                      >
                        Номер
                      </label>
                      <input
                        type="number"
                        value={customNumber}
                        onChange={(e) => {
                          setPlayerId('');
                          setCustomNumber(e.target.value);
                        }}
                        className="w-full p-2.5 text-sm text-white"
                        style={{
                          border: '1px solid var(--color-border)',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: 8,
                        }}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs mb-1 block"
                        style={{ color: 'var(--color-text-label)' }}
                      >
                        Фамилия
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => {
                          setPlayerId('');
                          setCustomName(e.target.value);
                        }}
                        className="w-full p-2.5 text-sm text-white"
                        style={{
                          border: '1px solid var(--color-border)',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: 8,
                        }}
                        placeholder="Иванов"
                      />
                    </div>
                  </div>
                </div>
              )}

              {type === 'custom' && (
                <div className="space-y-1">
                  <p className="text-sm mb-3" style={{ color: 'var(--color-text-stat)' }}>
                    Выберите элементы
                  </p>
                  {logoItems.map((c) => {
                    const isChecked = selectedLogos.includes(c.id);
                    return (
                      <div key={c.id}>
                        <label className="flex items-center gap-3 cursor-pointer py-1.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleLogo(c.id)}
                            style={{ accentColor: 'var(--color-accent)' }}
                            className="h-4 w-4"
                          />
                          {c.imageUrl && (c.type === 'logo' || c.type === 'flag') && (
                            <img
                              src={c.imageUrl}
                              alt={c.name}
                              className="h-6 w-auto object-contain"
                            />
                          )}
                          {(!c.imageUrl ||
                            c.type === 'text' ||
                            c.type === 'number' ||
                            c.type === 'name') && (
                            <span className="text-sm text-white">{c.name}</span>
                          )}
                          <span
                            className="text-xs ml-auto"
                            style={{ color: 'var(--color-text-stat)' }}
                          >
                            {Number(c.price) > 0
                              ? `+${Number(c.price).toFixed(2)} BYN`
                              : 'Бесплатно'}
                          </span>
                        </label>
                        {(c.type === 'number' ||
                          (c.type === 'text' && c.name.toLowerCase().includes('номер'))) &&
                          isChecked && (
                            <div className="ml-7 mt-1">
                              <input
                                type="number"
                                value={inputNumber}
                                onChange={(e) => setInputNumber(e.target.value)}
                                className="w-24 p-2 text-sm text-white"
                                style={{
                                  border: '1px solid var(--color-border)',
                                  background: 'rgba(255,255,255,0.05)',
                                  borderRadius: 6,
                                }}
                                placeholder="10"
                              />
                              {!isNumberValid && (
                                <p
                                  className="text-[10px] mt-0.5"
                                  style={{ color: 'var(--color-loss)' }}
                                >
                                  Введите номер
                                </p>
                              )}
                            </div>
                          )}
                        {(c.type === 'name' ||
                          (c.type === 'text' && c.name.toLowerCase().includes('фамилия'))) &&
                          isChecked && (
                            <div className="ml-7 mt-1">
                              <input
                                type="text"
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}
                                className="w-full max-w-[200px] p-2 text-sm text-white"
                                style={{
                                  border: '1px solid var(--color-border)',
                                  background: 'rgba(255,255,255,0.05)',
                                  borderRadius: 6,
                                }}
                                placeholder="Иванов"
                              />
                              {!isNameValid && (
                                <p
                                  className="text-[10px] mt-0.5"
                                  style={{ color: 'var(--color-loss)' }}
                                >
                                  Введите фамилию
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}

              {extraPrice > 0 && (
                <div
                  className="pt-4 flex justify-between"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--color-text-stat)' }}>
                    Стоимость нанесения:
                  </span>
                  <span className="text-lg font-bold text-white">+{extraPrice.toFixed(2)} BYN</span>
                </div>
              )}

              <div
                className="pt-4 flex justify-between"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <span className="text-sm font-bold text-white uppercase">Итого:</span>
                <span className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                  {(basePrice + extraPrice).toFixed(2)} BYN
                </span>
              </div>

              {(!isNumberValid || !isNameValid) && (
                <p className="text-xs" style={{ color: 'var(--color-loss)' }}>
                  Заполните номер и/или фамилию
                </p>
              )}

              <button
                onClick={applyCustomization}
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors"
                style={{ background: 'var(--color-accent)', borderRadius: 10 }}
              >
                Применить <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
