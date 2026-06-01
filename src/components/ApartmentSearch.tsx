import React, { useState } from 'react';
import { ApartmentInfo, RawTradeRecord, SelectedRegion } from '../types';
import { fetchRecentMonthsData } from '../utils/apiClient';
import { distinctAreas, makeAreaLabel } from '../utils/priceFilter';

interface Props {
  region: SelectedRegion | null;
  apartments: ApartmentInfo[];
  onAdd: (apt: ApartmentInfo) => void;
  onRemove: (id: string) => void;
  baseId: string;
  onBaseChange: (id: string) => void;
}

const ApartmentSearch: React.FC<Props> = ({
  region,
  apartments,
  onAdd,
  onRemove,
  baseId,
  onBaseChange,
}) => {
  const [searchName, setSearchName] = useState('');
  const [aptList, setAptList] = useState<string[]>([]);
  const [selectedApt, setSelectedApt] = useState('');
  const [areaOptions, setAreaOptions] = useState<number[]>([]);
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [rawRecords, setRawRecords] = useState<RawTradeRecord[]>([]);

  const handleSearch = async () => {
    if (!region?.lawdCd) {
      setSearchError('먼저 지역을 선택해주세요.');
      return;
    }

    setSearching(true);
    setSearchError('');
    setAptList([]);
    setSelectedApt('');
    setAreaOptions([]);
    setSelectedArea(null);

    try {
      const records = await fetchRecentMonthsData(region.lawdCd);
      setRawRecords(records);

      if (records.length === 0) {
        setSearchError('최근 해당 지역의 거래 내역이 없습니다. 지역을 확인해주세요.');
        return;
      }

      // 아파트명 목록 추출 + 검색어 필터
      const nameSet = new Set<string>();
      for (const r of records) {
        if (r.aptNm) nameSet.add(r.aptNm.trim());
      }

      const filtered = searchName.trim()
        ? Array.from(nameSet).filter((n) => n.includes(searchName.trim()))
        : Array.from(nameSet);

      const sorted = filtered.sort();
      setAptList(sorted);

      if (sorted.length === 0) {
        setSearchError(`"${searchName}" 아파트를 찾을 수 없습니다.`);
      }
    } catch (e: unknown) {
      setSearchError((e as Error).message || '조회 중 오류가 발생했습니다.');
    } finally {
      setSearching(false);
    }
  };

  const handleAptSelect = (name: string) => {
    setSelectedApt(name);
    setSelectedArea(null);

    if (!name) {
      setAreaOptions([]);
      return;
    }

    // 해당 아파트의 전용면적 목록 추출
    const areas = rawRecords
      .filter((r) => r.aptNm?.trim() === name)
      .map((r) => parseFloat(r.excluUseAr))
      .filter((a) => !isNaN(a));

    const grouped = distinctAreas(areas);
    setAreaOptions(grouped);
    if (grouped.length === 1) setSelectedArea(grouped[0]);
  };

  const handleAdd = () => {
    if (!region || !selectedApt || selectedArea === null) return;
    if (apartments.length >= 10) {
      alert('최대 10개 아파트까지 추가할 수 있습니다.');
      return;
    }

    const id = `${region.lawdCd}_${selectedApt}_${selectedArea}`;
    if (apartments.some((a) => a.id === id)) {
      alert('이미 추가된 아파트입니다.');
      return;
    }

    const info: ApartmentInfo = {
      id,
      name: selectedApt,
      lawdCd: region.lawdCd,
      area: selectedArea,
      areaLabel: makeAreaLabel(selectedArea),
      regionLabel: `${region.sido} ${region.sigungu}`,
    };

    onAdd(info);
    setSelectedApt('');
    setSelectedArea(null);
  };

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-gray-800 mb-3">아파트 추가</h2>

      {/* 검색 폼 */}
      <div className="flex flex-wrap gap-2 items-end mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">아파트명 검색</label>
          <input
            type="text"
            className="input-base w-44"
            placeholder="예: 래미안"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <button
          className="btn-primary h-9"
          onClick={handleSearch}
          disabled={!region?.lawdCd || searching}
        >
          {searching ? '조회 중...' : '아파트 조회'}
        </button>
      </div>

      {searchError && (
        <p className="text-red-500 text-sm mb-3">{searchError}</p>
      )}

      {/* 아파트 / 면적 선택 */}
      {aptList.length > 0 && (
        <div className="flex flex-wrap gap-2 items-end mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">아파트 선택</label>
            <select
              className="select-base w-52"
              value={selectedApt}
              onChange={(e) => handleAptSelect(e.target.value)}
            >
              <option value="">-- 선택 --</option>
              {aptList.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {areaOptions.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">전용면적</label>
              <select
                className="select-base w-52"
                value={selectedArea ?? ''}
                onChange={(e) => setSelectedArea(parseFloat(e.target.value))}
              >
                <option value="">-- 면적 선택 --</option>
                {areaOptions.map((a) => (
                  <option key={a} value={a}>
                    {makeAreaLabel(a)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            className="btn-primary h-9"
            onClick={handleAdd}
            disabled={!selectedApt || selectedArea === null}
          >
            추가
          </button>
        </div>
      )}

      {/* 추가된 아파트 목록 */}
      {apartments.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">
            비교 목록 ({apartments.length}/10)
          </p>
          <div className="flex flex-wrap gap-2">
            {apartments.map((apt) => (
              <div
                key={apt.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${
                  apt.id === baseId
                    ? 'bg-blue-50 border-blue-400 text-blue-800'
                    : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
              >
                {apartments.length >= 2 && (
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="baseApt"
                      checked={apt.id === baseId}
                      onChange={() => onBaseChange(apt.id)}
                      className="accent-blue-600"
                    />
                    <span className="text-xs text-blue-600 font-medium">기준</span>
                  </label>
                )}
                <span className="font-medium">{apt.name}</span>
                <span className="text-xs text-gray-500">{apt.areaLabel}</span>
                <span className="text-xs text-gray-400">{apt.regionLabel}</span>
                <button
                  onClick={() => onRemove(apt.id)}
                  className="ml-1 text-gray-400 hover:text-red-500 transition-colors font-bold leading-none"
                  title="삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentSearch;
