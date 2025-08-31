import { useState, useEffect, useMemo } from "react";
import {
  Pokemon,
  PokeApiResponse,
  POKEMON_CONFIG,
  GENERATION_ENDPOINTS,
} from "@/constants/pokemon";

// 포켓몬 ID
const getPokemonImageUrl = (id: number) =>
  `${POKEMON_CONFIG.IMAGE_BASE_URL}/${String(id).padStart(3, "0")}.png`;

// ID 기반으로 세대 판정
const determinePokemonGeneration = (id: number): string => {
  let offset = 0;
  for (const [gen, { limit }] of Object.entries(GENERATION_ENDPOINTS)) {
    if (id <= offset + limit) return gen;
    offset += limit;
  }
  return "1";
};

// 이름 포맷팅
const formatName = (name: string) =>
  name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

// 배치 처리
const fetchPokemonBatch = async (
  batch: Array<{ name: string; id: number }>
) => {
  return Promise.all(
    batch.map(async ({ name, id }) => {
      try {
        // 한국어 이름, 포켓몬 정보 가져오기
        const [speciesRes, pokemonRes] = await Promise.all([
          fetch(`${POKEMON_CONFIG.API_BASE_URL}/pokemon-species/${id}`),
          fetch(`${POKEMON_CONFIG.API_BASE_URL}/pokemon/${id}`),
        ]);

        const [species, pokemon] = await Promise.all([
          speciesRes.ok ? speciesRes.json() : null,
          pokemonRes.ok ? pokemonRes.json() : null,
        ]);

        // 데이터 추출
        return {
          name,
          koreanName:
            species?.names?.find(
              (n: { name: string; language: { name: string } }) =>
                n.language.name === POKEMON_CONFIG.KOREAN_LANG_CODE
            )?.name || formatName(name),
          image: getPokemonImageUrl(id),
          id,
          generation: determinePokemonGeneration(id),
          types:
            pokemon?.types?.map(
              (t: { type: { name: string; url: string } }) => t.type.name
            ) || [],
        };
      } catch {
        return {
          name,
          koreanName: formatName(name),
          image: getPokemonImageUrl(id),
          id,
          generation: determinePokemonGeneration(id),
          types: [],
        };
      }
    })
  );
};

// 캐시
const useCache = (key: string) => ({
  // 데이터/시간 기록이 있는지 && 7일 이내 기록인지 확인
  load: () => {
    try {
      const data = localStorage.getItem(key);
      const time = localStorage.getItem(`${key}_time`);
      if (
        data &&
        time &&
        Date.now() - parseInt(time) < 7 * 24 * 60 * 60 * 1000
      ) {
        return JSON.parse(data);
      }
    } catch {}
    return null;
  },
  // 데이터/시간 저장
  save: (data: Pokemon[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${key}_time`, Date.now().toString());
    } catch {}
  },
});

/* 메인 훅 */
export const usePokemon = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fullLoading, setFullLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const cache = useCache(POKEMON_CONFIG.STORAGE_KEY);

  // 배치 처리 함수를 분리
  const processBatch = async (
    batch: Array<{ name: string; id: number }>,
    currentProgress: number,
    total: number
  ) => {
    const batchData = await fetchPokemonBatch(batch);

    // 상태를 개별적으로 업데이트하고 즉시 반환
    return new Promise<void>((resolve) => {
      setPokemonList((prev) => {
        const newList = [...prev, ...batchData];
        // 캐시도 즉시 업데이트
        if (newList.length === total) {
          cache.save(newList);
        }
        return newList;
      });

      setLoadingProgress({
        current: currentProgress + batchData.length,
        total: total,
      });

      // 다음 프레임에서 resolve하여 렌더링이 완료된 후 진행
      requestAnimationFrame(() => {
        setTimeout(resolve, 10);
      });
    });
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchAll = async () => {
      if (isCancelled) return;

      try {
        // 캐시 체크
        const cached = cache.load();
        if (cached?.length && !isCancelled) {
          setPokemonList(cached);
          setIsLoading(false);
          return;
        }

        if (isCancelled) return;

        // 전체 목록 가져오기
        setFullLoading(true);
        const totalCount = Object.values(GENERATION_ENDPOINTS).reduce(
          (sum, gen) => sum + gen.limit,
          0
        );

        setLoadingProgress({ current: 0, total: totalCount });

        const { results }: PokeApiResponse = await fetch(
          `${POKEMON_CONFIG.API_BASE_URL}/pokemon?limit=${totalCount}`
        ).then((r) => r.json());

        if (isCancelled) return;

        // 400개씩 배치 처리
        const BATCH_SIZE = 400;

        for (let i = 0; i < results.length; i += BATCH_SIZE) {
          if (isCancelled) break;

          const batch = results
            .slice(i, i + BATCH_SIZE)
            .map((p, idx) => ({ name: p.name, id: i + idx + 1 }));

          await processBatch(batch, i, totalCount);
        }

        if (!isCancelled) {
          setFullLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch Pokemon"
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAll();

    // cleanup function
    return () => {
      isCancelled = true;
    };
  }, []);

  // 타입 확인 (필터에 사용)
  const availableTypes = useMemo(
    () => [...new Set(pokemonList.flatMap((p) => p.types))].sort(),
    [pokemonList]
  );

  return {
    pokemonList,
    isLoading,
    fullLoading,
    loadingProgress,
    error,
    availableTypes,
  };
};
