// src/app/shop/product/[slug]/ProductCustomization.tsx - Блок выбора нанесения
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

  // Сохраняем нанесение при закрытии модального окна
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
    (window as Record<string, unknown>).__lastCustomization = data;
    setModalOpen(false);
  };

  const renderCustomizationItem = (c: Customization) => {
    const isChecked = selectedLogos.includes(c.id);
    return (
      <div key={c.id}>
        <label className="flex items-center gap-3 cursor-pointer py-1.5">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => toggleLogo(c.id)}
            className="accent-[#ee862c] h-4 w-4"
          />
          {c.type === 'logo' && c.imageUrl && (
            <img src={c.imageUrl} alt={c.name} className="h-6 w-auto object-contain" />
          )}
          {c.type === 'flag' && c.imageUrl && (
            <img
              src={c.imageUrl}
              alt={c.name}
              className="h-6 w-auto object-contain border border-gray-200"
            />
          )}
          {(c.type === 'text' || c.type === 'number' || c.type === 'name' || !c.imageUrl) && (
            <span className="text-sm text-white">{c.name}</span>
          )}
          <span className="text-xs text-gray-400 ml-auto">
            {Number(c.price) > 0 ? `+${Number(c.price).toFixed(2)} BYN` : 'Бесплатно'}
          </span>
        </label>
        {(c.type === 'number' || (c.type === 'text' && c.name.toLowerCase().includes('номер'))) &&
          isChecked && (
            <div className="ml-7 mt-1">
              <input
                type="number"
                value={inputNumber}
                onChange={(e) => setInputNumber(e.target.value)}
                className="w-24 border border-white/10 bg-white/5 p-2 text-sm text-white outline-none focus:border-[#ee862c]"
                placeholder="10"
                min="1"
                max="99"
              />
              {!isNumberValid && <p className="text-[10px] text-red-400 mt-0.5">Введите номер</p>}
            </div>
          )}
        {(c.type === 'name' || (c.type === 'text' && c.name.toLowerCase().includes('фамилия'))) &&
          isChecked && (
            <div className="ml-7 mt-1">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full max-w-[200px] border border-white/10 bg-white/5 p-2 text-sm text-white outline-none focus:border-[#ee862c]"
                placeholder="Иванов"
              />
              {!isNameValid && <p className="text-[10px] text-red-400 mt-0.5">Введите фамилию</p>}
            </div>
          )}
      </div>
    );
  };

  return (
    <>
      <label className="mt-4 flex items-center justify-end gap-3 cursor-pointer">
        <span className="text-sm font-bold uppercase tracking-wider text-[#242C41]">
          Нанесение{' '}
          {extraPrice > 0 && <span className="text-[#ee862c]">(+{extraPrice.toFixed(2)} BYN)</span>}
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            setEnabled(e.target.checked);
            if (e.target.checked) {
              setModalOpen(true);
            } else {
              setSelectedLogos([]);
              setInputNumber('');
              setInputName('');
              setCustomNumber('');
              setCustomName('');
              setPlayerId('');
              delete (window as Record<string, unknown>).__lastCustomization;
            }
          }}
          className="h-4 w-4 accent-[#ee862c]"
        />
      </label>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10 bg-[#242C41]/95 backdrop-blur-xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3
                className="font-heading text-xl font-bold text-white"
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
                <p className="text-sm text-gray-400 mb-3">Тип нанесения</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="custType"
                      checked={type === 'full'}
                      onChange={() => setType('full')}
                      className="accent-[#ee862c]"
                    />
                    <span className="text-sm text-white">
                      Полное{' '}
                      {fullSetPrice > 0 && (
                        <span className="text-[#ee862c]">(+{fullSetPrice.toFixed(2)} BYN)</span>
                      )}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="custType"
                      checked={type === 'custom'}
                      onChange={() => setType('custom')}
                      className="accent-[#ee862c]"
                    />
                    <span className="text-sm text-white">Выбрать элементы</span>
                  </label>
                </div>
              </div>
              {type === 'full' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Выберите игрока или введите свои данные</p>
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
                    className="w-full border border-white/10 bg-[#1a1a2e] p-2.5 text-sm text-white"
                  >
                    <option value="" className="bg-[#1a1a2e] text-white">
                      — Выбрать игрока —
                    </option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#1a1a2e] text-white">
                        #{p.number} {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 text-center">— или —</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Номер</label>
                      <input
                        type="number"
                        value={customNumber}
                        onChange={(e) => {
                          setPlayerId('');
                          setCustomNumber(e.target.value);
                        }}
                        className="w-full border border-white/10 bg-white/5 p-2.5 text-sm text-white"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Фамилия</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => {
                          setPlayerId('');
                          setCustomName(e.target.value);
                        }}
                        className="w-full border border-white/10 bg-white/5 p-2.5 text-sm text-white"
                        placeholder="Иванов"
                      />
                    </div>
                  </div>
                </div>
              )}
              {type === 'custom' && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-400 mb-3">Выберите элементы</p>
                  {logoItems.map((c) => renderCustomizationItem(c))}
                </div>
              )}
              {extraPrice > 0 && (
                <div className="border-t border-white/10 pt-4 flex justify-between">
                  <span className="text-sm text-gray-400">Стоимость нанесения:</span>
                  <span className="text-lg font-bold text-white">+{extraPrice.toFixed(2)} BYN</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-4 flex justify-between">
                <span className="text-sm font-bold text-white uppercase">Итого:</span>
                <span className="text-xl font-bold text-[#ee862c]">
                  {(basePrice + extraPrice).toFixed(2)} BYN
                </span>
              </div>
              {(!isNumberValid || !isNameValid) && (
                <p className="text-xs text-red-400">Заполните номер и/или фамилию</p>
              )}
              <button
                onClick={applyCustomization}
                className="w-full inline-flex items-center justify-center gap-3 bg-[#ee862c] px-8 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#f0ac74] transition-colors"
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
