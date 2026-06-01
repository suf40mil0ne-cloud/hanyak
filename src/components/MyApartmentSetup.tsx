import React, { useState } from 'react';
import RegionSelector from './RegionSelector';
import { ApartmentInfo, RawTradeRecord, SelectedRegion } from '../types';
import { fetchLatestMonthData } from '../utils/apiClient';
import { groupAreas, makeAreaLabel } from '../utils/priceFilter';

interface Props {
  baseInfo: ApartmentInfo | null; // 설정 완료된 기준 아파트
  onConfirm: (info: ApartmentInfo) => void;
  onClear: () => void;
  loading: boolean; // 부모가 기준 아파트 5개년 데이터 로딩 중
}

/**
 * 탭 3 상단: 내 아파트(기준) 설정.
 * 탭 1의 지역 선택 + 아파트 검색 UI를 재사용한다.
 * 시/도 → 시/군/구 → 아파트 조회 → 아파트 선택 → 평형 선택 → [기준 아파트로 설정]
 */
const MyApartmentSetup: React.FC<Props> = ({ baseInfo, onConfirm, onClear, loading }) => {
  const [region, setRegion] = useState<SelectedRegion | null>(null);
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
      const records = await fetchLatestMonthData(region.lawdCd);
      setRawRecords(records);

      if (records.length === 0) {
        setSearchError('이번 달 해당 지역의 거래 내역이 없습니다. 지역을 확인해주세요.');
        return;
      }

      const nameSet = new Set<string>();
      for (const r of records) if (r.aptNm) nameSet.add(r.aptNm.trim());

      const filtered = searchName.trim()
        ? Array.from(nameSet).filter((n) => n.includes(searchName.trim()))
        : Array.from(nameSet);
      const sorted = filtered.sort();
      setAptList(sorted);
      if (sorted.length === 0) setSearchError(`"${searchName}" 아파트를 찾을 수 없습니다.`);
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
    const areas = rawRecords
      .filter((r) => r.aptNm?.trim() === name)
      .map((r) => parseFloat(r.excluUseAr))
      .filter((a) => !isNaN(a));
    const grouped = groupAreas(areas);
    setAreaOptions(grouped);
    if (grouped.length === 1) setSelectedArea(grouped[0]);
  };

  const handleConfirm = () => {
    if (!region || !selectedApt || selectedArea === null) return;
    const info: ApartmentInfo = {
      id: `${region.lawdCd}_${selectedApt}_${selectedArea}`,
      name: selectedApt,
      lawdCd: region.lawdCd,
      area: selectedArea,
      areaLabel: makeAreaLabel(selectedArea),
      regionLabel: `${region.sido} ${region.sigungu}`,
    };
    onConfirm(info);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <h2 className="text-base font-semibold text-gray-800">🏠 내 아파트 설정 (기준)</h2>
        {baseInfo && (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[13px] font-semibold rounded-full px-3 py-1">
            📍 기준: {baseInfo.name} {baseInfo.areaLabel}
            <button
              onClick={onClear}
              className="ml-0.5 text-blue-400 hover:text-red-500 font-bold leading-none"
              title="기준 해제"
            >
              ×
            </button>
          </span>
        )}
      </div>

      <RegionSelector selected={region} onChange={setRegion} />

      {/* 검색 폼 */}
      <div className="flex flex-wrap gap-2 items-end mt-4">
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

      {searchError && <p className="text-red-500 text-sm mt-3">{searchError}</p>}

      {/* 아파트 / 면적 선택 + 설정 버튼 */}
      {aptList.length > 0 && (
        <div className="flex flex-wrap gap-2 items-end mt-4">
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
              <label className="text-xs text-gray-500 font-medium">전용면적 (평형)</label>
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
            onClick={handleConfirm}
            disabled={!selectedApt || selectedArea === null || loading}
          >
            {loading ? '데이터 조회 중...' : '기준 아파트로 설정'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyApartmentSetup;
