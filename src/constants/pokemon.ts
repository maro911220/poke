// 타입 정의
export interface Pokemon {
  name: string;
  koreanName: string;
  image: string;
  id: number;
  generation: string;
  types: string[];
}

export interface PokeApiResponse {
  results: {
    name: string;
    url: string;
  }[];
}

export interface FilterItem {
  key: string;
  label: string;
}

export interface FilterCheckboxGroupProps {
  title: string;
  items: FilterItem[];
  selectedItems: string[];
  setSelectedItems: (updater: (prev: string[]) => string[]) => void;
}

export interface PokemonSearchProps {
  pokeDexRef: React.RefObject<HTMLElement | null>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTypes: string[];
  availableTypes: string[];
  setSelectedTypes: (value: string[] | ((prev: string[]) => string[])) => void;
  selectedGenerations: string[];
  setSelectedGenerations: (generations: string[]) => void;
}

export type PokemonSprites = {
  front_default: string | null;
  back_default: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
  other: {
    "official-artwork": {
      front_default: string | null;
    };
    dream_world: {
      front_default: string | null;
    };
  };
};

export type PokemonDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string; url: string } }[];
  abilities: {
    ability: {
      name: string;
      url: string;
    };
  }[];
  stats: { base_stat: number; stat: { name: string } }[];
  sprites: PokemonSprites;
};

export interface TypeDetail {
  names: { name: string; language: { name: string } }[];
}

export type Species = {
  evolution_chain: { url: string };
  names: { name: string; language: { name: string } }[];
};

export type EvolutionNode = {
  species: { name: string; url: string };
  evolves_to: EvolutionNode[];
};

export type Evolution = {
  chain: EvolutionNode;
};

export type EvolutionTree = {
  pokemon: { name: string; url: string };
  evolutions: EvolutionTree[];
  level: number;
};

export type SpriteImage = {
  name: string;
  url: string;
};

export type PokeStats = {
  name: string;
  originalName: string;
  value: number;
};

export type PokeBasicInfo = {
  height: number;
  weight: number;
  abilities: {
    is_hidden?: boolean;
    ability: { koreanName: string; name: string };
  }[];
};

export interface BasicInfoProps {
  stats: Array<PokeStats> | undefined;
  basicInfo: PokeBasicInfo;
  typeColors: string[];
  localizedTypes: string[];
}

export interface EvolutionProps {
  evolutionTree: EvolutionTree | null | undefined;
  currentPokemonName: string;
  evolutionValidation:
    | { containsPokemon: boolean; hasEvolutions: boolean }
    | undefined;
  evolutionData: Record<string, EvolutionCardData> | undefined;
}

export interface EvolutionTreeProps {
  evolutionTree: EvolutionTree;
  currentPokemonName: string;
  evolutionData: Record<string, EvolutionCardData>;
}

export interface EvolutionCardProps {
  pokemonName: string;
  isActive: boolean;
  cardData?: EvolutionCardData;
}

export type EvolutionCardData = {
  id: string;
  koreanName: string;
  imageUrl: string;
};

// 설정 상수
export const POKEMON_CONFIG = {
  STORAGE_KEY: "pokemonList",
  STORAGE_VERSION: "v2",
  API_BASE_URL: "https://pokeapi.co/api/v2",
  IMAGE_BASE_URL: "https://assets.pokemon.com/assets/cms2/img/pokedex/detail",
  KOREAN_LANG_CODE: "ko",
} as const;

// 세대별 포켓몬 정보
export const GENERATION_ENDPOINTS = {
  "1": { limit: 151, offset: 0 },
  "2": { limit: 100, offset: 151 },
  "3": { limit: 135, offset: 251 },
  "4": { limit: 107, offset: 386 },
  "5": { limit: 156, offset: 493 },
  "6": { limit: 72, offset: 649 },
  "7": { limit: 88, offset: 721 },
  "8": { limit: 96, offset: 809 },
  "9": { limit: 120, offset: 905 },
} as const;

// 타입 한국어 번역
export const POKEMON_TYPES = {
  normal: { name: "노말", color: "#9FA19F" },
  fire: { name: "불꽃", color: "#E62829" },
  water: { name: "물", color: "#2980EF" },
  electric: { name: "전기", color: "#FAC000" },
  grass: { name: "풀", color: "#3FA129" },
  ice: { name: "얼음", color: "#3DCEF3" },
  fighting: { name: "격투", color: "#FF8000" },
  poison: { name: "독", color: "#9141CB" },
  ground: { name: "땅", color: "#915121" },
  flying: { name: "비행", color: "#81B9EF" },
  psychic: { name: "에스퍼", color: "#EF4179" },
  bug: { name: "벌레", color: "#91A119" },
  rock: { name: "바위", color: "#AFA981" },
  ghost: { name: "고스트", color: "#704170" },
  dragon: { name: "드래곤", color: "#5060E1" },
  dark: { name: "악", color: "#624D4E" },
  steel: { name: "강철", color: "#60A1B8" },
  fairy: { name: "페어리", color: "#EF70EF" },
} as const;

export const STAT_MAX_VALUES: Record<string, number> = {
  HP: 255,
  방어: 230,
  특수방어: 230,
  default: 200,
};
