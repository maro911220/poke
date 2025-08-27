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
              (n: any) => n.language.name === POKEMON_CONFIG.KOREAN_LANG_CODE
            )?.name || formatName(name),
          image: getPokemonImageUrl(id),
          id,
          generation: determinePokemonGeneration(id),
          types: pokemon?.types?.map((t: any) => t.type.name) || [],
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
  const [error, setError] = useState<string | null>(null);
  const cache = useCache(POKEMON_CONFIG.STORAGE_KEY);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 캐시 체크
        const cached = cache.load();
        if (cached?.length) {
          setPokemonList(cached);
          setIsLoading(false);
          return;
        }

        // 전체 목록 가져오기
        const totalCount = Object.values(GENERATION_ENDPOINTS).reduce(
          (sum, gen) => sum + gen.limit,
          0
        );
        const { results }: PokeApiResponse = await fetch(
          `${POKEMON_CONFIG.API_BASE_URL}/pokemon?limit=${totalCount}`
        ).then((r) => r.json());

        // 50개씩 배치 처리 (안전성 )
        const processed: Pokemon[] = [];
        for (let i = 0; i < results.length; i += 50) {
          const batch = results
            .slice(i, i + 50)
            .map((p, idx) => ({ name: p.name, id: i + idx + 1 }));
          const batchData = await fetchPokemonBatch(batch);
          processed.push(...batchData);
        }

        // 업데이트, 로컬에 저장
        setPokemonList([...processed]);
        cache.save(processed);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch Pokemon"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  // 타입 확인 (필터에 사용)
  const availableTypes = useMemo(
    () => [...new Set(pokemonList.flatMap((p) => p.types))].sort(),
    [pokemonList]
  );

  return { pokemonList, isLoading, error, availableTypes };
};
