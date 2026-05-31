import React from 'react';
import { SIDO_LIST, getSigunguList, getLawdCd } from '../data/lawdCodes';
import { SelectedRegion } from '../types';

interface Props {
  selected: SelectedRegion | null;
  onChange: (region: SelectedRegion) => void;
}

const RegionSelector: React.FC<Props> = ({ selected, onChange }) => {
  const handleSidoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sido = e.target.value;
    if (!sido) return;
    const list = getSigunguList(sido);
    if (list.length === 1) {
      // 세종특별자치시처럼 구가 하나인 경우 자동 선택
      const sigungu = list[0];
      const lawdCd = getLawdCd(sido, sigungu);
      if (lawdCd) onChange({ sido, sigungu, lawdCd });
    } else {
      onChange({ sido, sigungu: '', lawdCd: '' });
    }
  };

  const handleSigunguChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sigungu = e.target.value;
    if (!sigungu || !selected?.sido) return;
    const lawdCd = getLawdCd(selected.sido, sigungu);
    if (lawdCd) onChange({ ...selected, sigungu, lawdCd });
  };

  const sigunguList = selected?.sido ? getSigunguList(selected.sido) : [];

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-gray-800 mb-3">지역 선택</h2>
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">시 / 도</label>
          <select
            className="select-base w-44"
            value={selected?.sido || ''}
            onChange={handleSidoChange}
          >
            <option value="">-- 시/도 선택 --</option>
            {SIDO_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">시 / 군 / 구</label>
          <select
            className="select-base w-48"
            value={selected?.sigungu || ''}
            onChange={handleSigunguChange}
            disabled={!selected?.sido || sigunguList.length === 0}
          >
            <option value="">-- 시/군/구 선택 --</option>
            {sigunguList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {selected?.lawdCd && (
          <div className="flex items-end pb-0.5">
            <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-1.5 font-mono">
              법정동코드: {selected.lawdCd}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionSelector;
