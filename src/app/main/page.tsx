"use client";
import "@/style/main.css";
import { useState, useMemo, useRef } from "react";
import { usePokemon } from "@/hooks/usePokemon";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PokemonCard } from "./_components/PokemonCard";
import { PokemonSearch } from "./_components/PokemonSearch";

// 포켓몬 목록 메인 컴포넌트
export default function PokemonListPage() {
  const pokeDexRef = useRef<HTMLDivElement>(null);
  const { pokemonList, isLoading, availableTypes } = usePokemon();
  const [filters, setFilters] = useState({
    generations: [] as string[],
    types: [] as string[],
    search: "",
  });

  // 필터 업데이트 함수
  const updateFilter = {
    generations: (value: string[] | ((prev: string[]) => string[])) =>
      setFilters((prev) => ({
        ...prev,
        generations:
          typeof value === "function" ? value(prev.generations) : value,
      })),
    types: (value: string[] | ((prev: string[]) => string[])) =>
      setFilters((prev) => ({
        ...prev,
        types: typeof value === "function" ? value(prev.types) : value,
      })),
    search: (value: string | ((prev: string) => string)) =>
      setFilters((prev) => ({
        ...prev,
        search: typeof value === "function" ? value(prev.search) : value,
      })),
    clear: () => setFilters({ generations: [], types: [], search: "" }),
  };

  // 검색 모드 확인 & 필터링 로직
  const { isSearchMode, filteredPokemon } = useMemo(() => {
    const { search, generations, types } = filters;
    const hasFilters = search.trim() || generations.length || types.length;

    if (!hasFilters) {
      return { isSearchMode: false, filteredPokemon: pokemonList };
    }

    const searchTerm = search.toLowerCase().trim();
    const filtered = pokemonList.filter((pokemon) => {
      // 세대 필터
      if (generations.length && !generations.includes(pokemon.generation)) {
        return false;
      }
      // 타입 필터
      if (types.length && !pokemon.types.some((type) => types.includes(type))) {
        return false;
      }
      // 검색어 필터
      if (
        searchTerm &&
        !pokemon.name.toLowerCase().includes(searchTerm) &&
        !pokemon.koreanName.toLowerCase().includes(searchTerm)
      ) {
        return false;
      }
      return true;
    });

    return { isSearchMode: true, filteredPokemon: filtered };
  }, [pokemonList, filters]);

  // 로딩
  if (isLoading) {
    return <Loading text="포켓몬 정보를 불러오는 중..." />;
  }

  return (
    <ScrollArea className="container poke-dex" ref={pokeDexRef}>
      <article className="poke-dex-layout">
        <h2 className="hidden">포켓몬 리스트</h2>
        <div className="poke-dex-list">
          {/* 포켓몬 카드들 */}
          {filteredPokemon.map((pokemon, index) => (
            <PokemonCard pokemon={pokemon} key={`${pokemon.id}-${index}`} />
          ))}

          {/* 검색 결과가 없을 때 */}
          {isSearchMode && filteredPokemon.length === 0 && (
            <div className="poke-dex-list__search">
              <p>{filters.search} 결과가 없습니다.</p>
              <Button onClick={updateFilter.clear}>
                리스트 새로고침 <RefreshCcw />
              </Button>
            </div>
          )}
        </div>

        <PokemonSearch
          pokeDexRef={pokeDexRef}
          searchTerm={filters.search}
          setSearchTerm={updateFilter.search}
          selectedGenerations={filters.generations}
          setSelectedGenerations={updateFilter.generations}
          selectedTypes={filters.types}
          setSelectedTypes={updateFilter.types}
          availableTypes={availableTypes}
        />
      </article>
    </ScrollArea>
  );
}
