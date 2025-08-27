import { useState, useEffect, useMemo } from "react";
import {
  POKEMON_TYPES,
  PokemonDetail,
  Species,
  Evolution,
  EvolutionNode,
  EvolutionTree,
  PokemonSprites,
  SpriteImage,
  EvolutionCardData,
} from "@/constants/pokemon";

const API_BASE = "https://pokeapi.co/api/v2";

// API 호출 통합
const apiCall = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return res.json();
};

// 한국어 이름 가져오기
const getKoreanName = async (url: string): Promise<string> => {
  try {
    const data = await apiCall<{
      names: { name: string; language: { name: string } }[];
    }>(url);
    return data.names.find((n) => n.language.name === "ko")?.name || "Unknown";
  } catch {
    return "Unknown";
  }
};

// 이미지 URL 생성
const getImageUrl = (id: string) =>
  `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${id.padStart(
    3,
    "0"
  )}.png`;

// 타입 컬러 지정
const getTypeColor = (koreanType: string) =>
  Object.values(POKEMON_TYPES).find((t) => t.name === koreanType)?.color ||
  "bg-gray-500";

// 능력치 관련 포맷팅
const formatStats = (stats: PokemonDetail["stats"]) =>
  stats.map((stat) => ({
    name:
      {
        hp: "HP",
        attack: "공격",
        defense: "방어",
        "special-attack": "특수공격",
        "special-defense": "특수방어",
        speed: "스피드",
      }[stat.stat.name] || stat.stat.name,
    originalName: stat.stat.name,
    value: stat.base_stat,
  }));

// 진화트리
const buildEvolutionTree = (
  chain: EvolutionNode,
  level = 0
): EvolutionTree => ({
  pokemon: { name: chain.species.name, url: chain.species.url },
  evolutions: chain.evolves_to.map((evo) => buildEvolutionTree(evo, level + 1)),
  level,
});

// 진화 트리에서 모든 포켓몬 이름 추출
const extractAllPokemonNames = (tree: EvolutionTree): string[] => {
  const names = [tree.pokemon.name];
  tree.evolutions.forEach((subTree) => {
    names.push(...extractAllPokemonNames(subTree));
  });
  return [...new Set(names)];
};

// 진화 데이터 로드
const loadEvolutionData = async (
  evolutionTree: EvolutionTree
): Promise<Record<string, EvolutionCardData>> => {
  const pokemonNames = extractAllPokemonNames(evolutionTree);

  // 모든 포켓몬 데이터를 병렬로 가져오기
  const dataPromises = pokemonNames.map(async (name) => {
    try {
      // 포켓몬 기본 정보와 종족 정보를 병렬로 가져오기
      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`${API_BASE}/pokemon/${name}`),
        fetch(`${API_BASE}/pokemon-species/${name}`),
      ]);

      const [pokemon, species] = await Promise.all([
        pokemonRes.json(),
        speciesRes.json(),
      ]);

      const koreanName = species.names.find(
        (n: { name: string; language: { name: string } }) =>
          n.language.name === "ko"
      )?.name;
      const imageUrl = getImageUrl(String(pokemon.id));

      return {
        name,
        data: {
          id: String(pokemon.id),
          koreanName,
          imageUrl,
        },
      };
    } catch (error) {
      console.error(`Failed to load evolution data for ${name}:`, error);
      return null;
    }
  });

  // Promise.allSettled로 부분 실패 허용
  const results = await Promise.allSettled(dataPromises);
  const evolutionData: Record<string, EvolutionCardData> = {};

  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      evolutionData[result.value.name] = result.value.data;
    }
  });

  return evolutionData;
};

// 스프라이트 추출
const extractSprites = (sprites: PokemonSprites): SpriteImage[] => {
  const images: SpriteImage[] = [];
  const addImage = (name: string, url: string | null | undefined) => {
    if (url && typeof url === "string") images.push({ name, url });
  };

  addImage(
    "Official Artwork",
    sprites.other?.["official-artwork"]?.front_default
  );
  addImage("Dream World", sprites.other?.dream_world?.front_default);
  addImage("Normal Front", sprites.front_default);
  addImage("Normal Back", sprites.back_default);
  addImage("Shiny Front", sprites.front_shiny);
  addImage("Shiny Back", sprites.back_shiny);

  return images;
};

/* 메인 훅 */
export function usePokemonDetail(id: string) {
  const [data, setData] = useState<{
    pokemon: PokemonDetail | null;
    species: Species | null;
    evolution: Evolution | null;
    localizedTypes: string[];
    localizedAbilities: { original: string; korean: string }[];
    evolutionData: Record<string, EvolutionCardData>;
  }>({
    pokemon: null,
    species: null,
    evolution: null,
    localizedTypes: [],
    localizedAbilities: [],
    evolutionData: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 기본 데이터
        const [pokemon, species] = await Promise.all([
          apiCall<PokemonDetail>(`${API_BASE}/pokemon/${id}`),
          apiCall<Species>(`${API_BASE}/pokemon-species/${id}`),
        ]);

        // 추가 데이터
        const [evolutionResult, typesResults, abilitiesResults] =
          await Promise.allSettled([
            apiCall<Evolution>(species.evolution_chain.url),
            Promise.all(pokemon.types.map((t) => getKoreanName(t.type.url))),
            Promise.all(
              pokemon.abilities.map(async (ability) => ({
                original: ability.ability.name,
                korean: await getKoreanName(
                  `${API_BASE}/ability/${ability.ability.name}`
                ),
              }))
            ),
          ]);

        const evolution =
          evolutionResult.status === "fulfilled" ? evolutionResult.value : null;

        // 진화 데이터 로드 (진화 정보가 있을 때만)
        let evolutionData: Record<string, EvolutionCardData> = {};
        if (evolution) {
          try {
            const evolutionTree = buildEvolutionTree(evolution.chain);
            evolutionData = await loadEvolutionData(evolutionTree);
          } catch (evolutionError) {
            console.error("Failed to load evolution data:", evolutionError);
          }
        }

        setData({
          pokemon,
          species,
          evolution,
          localizedTypes:
            typesResults.status === "fulfilled" ? typesResults.value : [],
          localizedAbilities:
            abilitiesResults.status === "fulfilled"
              ? abilitiesResults.value
              : [],
          evolutionData,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 데이터 가공
  const processedData = useMemo(() => {
    if (!data.pokemon || !data.species) return null;

    const {
      pokemon,
      species,
      evolution,
      localizedTypes,
      localizedAbilities,
      evolutionData,
    } = data;

    return {
      pokemon,
      species,
      evolution,
      koreanName:
        species.names.find((n) => n.language.name === "ko")?.name ||
        pokemon.name,
      localizedTypes,
      typeColors: localizedTypes.map(getTypeColor),
      basicInfo: {
        height: pokemon.height / 10,
        weight: pokemon.weight / 10,
        abilities: pokemon.abilities.map((ability, idx) => ({
          ...ability,
          ability: {
            ...ability.ability,
            koreanName: localizedAbilities[idx]?.korean || ability.ability.name,
          },
        })),
      },
      pokemonStats: formatStats(pokemon.stats),
      evolutionTree: evolution ? buildEvolutionTree(evolution.chain) : null,
      evolutionValidation: {
        containsPokemon: !!evolution,
        hasEvolutions:
          Array.isArray(evolution?.chain?.evolves_to) &&
          evolution.chain.evolves_to.length > 0,
      },
      representativeSprites: extractSprites(pokemon.sprites),
      evolutionData,
    };
  }, [data, id]);

  return { ...processedData, loading, error };
}
