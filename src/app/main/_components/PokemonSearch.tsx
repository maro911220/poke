import { useCallback, useEffect, useState } from "react";
import {
  POKEMON_TYPES,
  GENERATION_ENDPOINTS,
  PokemonSearchProps,
} from "@/constants/pokemon";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterCheckboxGroup } from "./FilterCheckboxGroup";
import { RefreshCcw, Search, ArrowUp } from "lucide-react";

// 검색 Drawer 메인 컴포넌트
export const PokemonSearch = ({
  pokeDexRef,
  searchTerm,
  setSearchTerm,
  availableTypes,
  selectedTypes,
  setSelectedTypes,
  selectedGenerations,
  setSelectedGenerations,
}: PokemonSearchProps) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(searchTerm || "");
  const [scrollPos, setScrollPos] = useState(0);
  const [tempFilters, setTempFilters] = useState({
    types: selectedTypes,
    generations: selectedGenerations,
  });

  // 스크롤 감지
  useEffect(() => {
    const viewport = pokeDexRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (!viewport) return;

    const handleScroll = () => setScrollPos(viewport.scrollTop);
    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [pokeDexRef]);

  // 스크롤 TOP
  const scrollToTop = useCallback(() => {
    const viewport = pokeDexRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    viewport?.scrollTo({ top: 0, behavior: "smooth" });
  }, [pokeDexRef]);

  // 검색 실행
  const handleSearch = useCallback(() => {
    setSearchTerm(input.trim());
    setSelectedTypes(tempFilters.types);
    setSelectedGenerations(tempFilters.generations);
    setOpen(false);
  }, [
    input,
    tempFilters,
    setSearchTerm,
    setSelectedTypes,
    setSelectedGenerations,
  ]);

  // 엔터키 처리
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  // 필터 초기화
  const clearFilters = useCallback(() => {
    setInput("");
    setTempFilters({ types: [], generations: [] });
  }, []);

  // 임시 필터 업데이트
  const updateTempFilter = {
    types: (value: string[] | ((prev: string[]) => string[])) =>
      setTempFilters((prev) => ({
        ...prev,
        types: typeof value === "function" ? value(prev.types) : value,
      })),
    generations: (value: string[] | ((prev: string[]) => string[])) =>
      setTempFilters((prev) => ({
        ...prev,
        generations:
          typeof value === "function" ? value(prev.generations) : value,
      })),
  };

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button className="poke-dex-search" aria-label="검색 열기">
            <Search />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="poke-dex-filter">
          <DrawerHeader className="poke-dex-filter__header">
            <DrawerTitle>검색</DrawerTitle>
            <Button
              variant="outline"
              onClick={clearFilters}
              aria-label="모든 필터 초기화"
            >
              초기화 <RefreshCcw />
            </Button>
            <DrawerDescription className="hidden" />
          </DrawerHeader>

          <div className="container poke-dex-filter__search">
            {/* 검색 입력 */}
            <div className="poke-dex-filter__input">
              <Input
                type="text"
                placeholder="포켓몬 이름으로 검색하세요"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                autoFocus
              />
              <Button variant="ghost" onClick={handleSearch} className="w-fit">
                <Search />
              </Button>
            </div>

            {/* 필터 그룹 */}
            <div className="poke-dex-filter__box">
              <FilterGroup
                title="세대"
                items={Object.keys(GENERATION_ENDPOINTS).map((gen) => ({
                  key: gen,
                  label: `${gen}세대`,
                }))}
                selectedItems={tempFilters.generations}
                setSelectedItems={updateTempFilter.generations}
              />
              <FilterGroup
                title="타입"
                items={availableTypes.map((type) => ({
                  key: type,
                  label:
                    POKEMON_TYPES[type as keyof typeof POKEMON_TYPES]?.name ||
                    type,
                }))}
                selectedItems={tempFilters.types}
                setSelectedItems={updateTempFilter.types}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* TOP 버튼 */}
      {scrollPos > 100 && (
        <Button
          onClick={scrollToTop}
          className="poke-dex-up"
          aria-label="맨 위로 이동"
        >
          <ArrowUp />
        </Button>
      )}
    </>
  );
};

// 통합된 필터 컴포넌트
const FilterGroup = ({
  title,
  items,
  selectedItems,
  setSelectedItems,
}: {
  title: string;
  items: { key: string; label: string }[];
  selectedItems: string[];
  setSelectedItems: (value: string[] | ((prev: string[]) => string[])) => void;
}) => (
  <FilterCheckboxGroup
    title={title}
    items={items}
    selectedItems={selectedItems}
    setSelectedItems={setSelectedItems}
  />
);
