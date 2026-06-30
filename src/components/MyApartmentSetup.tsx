import React, { useState } from 'react';
import RegionSelector from './RegionSelector';
import { ApartmentInfo, RawTradeRecord, SelectedRegion } from '../types';
import { fetchAreaScanData } from '../utils/apiClient';
import { distinctAreas, makeAreaLabel, buildAptOptions, AptOption } from '../utils/priceFilter';

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
  const [umdList, setUmdList] = useState<string[]>([]);
  const [selectedUmd, setSelectedUmd] = useState('');
  const [aptList, setAptList] = useState<AptOption[]>([]);
  const [selectedApt, setSelectedApt] = useState('');
  const [areaOptions, setAreaOptions] = useState<number[]>([]);
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const [areaMsg, setAreaMsg] = useState('');
  const [searchError, setSearchError] = useState('');
  const [rawRecords, setRawRecords] = useState<RawTradeRecord[]>([]);

  // 시군구 최근 2개월 데이터를 1회 조회(globalCache 재사용) → 동 목록 추출. 이후 동/아파트 선택은 재호출 없이 필터링.
  const handleLoad = async () => {
    if (!region?.lawdCd) {
      setSearchError('먼저 지역을 선택해주세요.');
      return;
    }
    setSearching(true);
    setScanMsg('');
    setAreaMsg('');
    setSearchError('');
    setUmdList([]);
    setSelectedUmd('');
    setAptList([]);
    setSelectedApt('');
    setAreaOptions([]);
    setSelectedArea(null);

    try {
      const records = await fetchAreaScanData(region.lawdCd, () => setScanMsg('아파트 목록 불러오는 중...'), 2);
      setRawRecords(records);

      if (records.length === 0) {
        setSearchError('해당 지역에 거래 데이터가 없습니다');
        return;
      }

      // umdNm(법정동) 목록: 중복 제거 + 가나다순
      const umds = Array.from(
        new Set(records.map((r) => r.umdNm?.trim()).filter((u): u is string => !!u))
      ).sort((a, b) => a.localeCompare(b, 'ko'));
      setUmdList(umds);
    } catch (e: unknown) {
      setSearchError((e as Error).message || '조회 중 오류가 발생했습니다.');
    } finally {
      setSearching(false);
      setScanMsg('');
    }
  };

  // 동 선택 → 재호출 없이 보관된 데이터에서 해당 동 아파트만 필터링(거래건수 내림차순)
  const handleUmdSelect = (umd: string) => {
    setSelectedUmd(umd);
    setSelectedApt('');
    setSelectedArea(null);
    setAreaOptions([]);
    setAreaMsg('');
    setAptList(umd ? buildAptOptions(rawRecords.filter((r) => r.umdNm?.trim() === umd), '') : []);
  };

  const handleAptSelect = (name: string) => {
    setSelectedApt(name);
    setSelectedArea(null);
    setAreaMsg('');
    if (!name) {
      setAreaOptions([]);
      return;
    }
    const areas = rawRecords
      .filter((r) => r.aptNm?.trim() === name)
      .map((r) => parseFloat(r.excluUseAr))
      .filter((a) => !isNaN(a));
    const grouped = distinctAreas(areas);
    setAreaOptions(grouped);
    setAreaMsg(grouped.length > 0 ? `${grouped.length}개 평형 발견` : '');
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

      {/* 1단계: 지역의 아파트 불러오기 (최근 2개월, globalCache 재사용) */}
      <div className="flex flex-wrap gap-2 items-end mt-4">
        <button
          className="btn-primary h-9 w-full sm:w-auto"
          onClick={handleLoad}
          disabled={!region?.lawdCd || searching}
        >
          {searching ? '불러오는 중...' : '이 지역 아파트 불러오기'}
        </button>

        {searching && scanMsg && (
          <span className="text-xs text-gray-500 flex items-center gap-1.5 pb-1">
            <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            {scanMsg}
          </span>
        )}
      </div>

      {searchError && <p className="text-red-500 text-sm mt-3 whitespace-pre-line">{searchError}</p>}

      {/* 2·3단계: 동 선택 → 아파트 선택 (API 재호출 없이 필터링) + 설정 버튼 */}
      {umdList.length > 0 && (
        <div className="flex flex-wrap gap-2 items-end mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">동 선택 (총 {umdList.length}개 동)</label>
            <select
              className="select-base w-full sm:w-44"
              value={selectedUmd}
              onChange={(e) => handleUmdSelect(e.target.value)}
            >
              <option value="">-- 동 선택 --</option>
              {umdList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              아파트 선택{selectedUmd && ` (${aptList.length}개)`}
            </label>
            <select
              className="select-base w-full sm:w-64"
              value={selectedApt}
              onChange={(e) => handleAptSelect(e.target.value)}
              disabled={!selectedUmd}
            >
              <option value="">-- 선택 --</option>
              {aptList.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name} (거래 {o.count}건)
                </option>
              ))}
            </select>
          </div>

          {areaOptions.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">
                전용면적 (평형){areaMsg && <span className="text-blue-600 ml-1">· {areaMsg}</span>}
              </label>
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
