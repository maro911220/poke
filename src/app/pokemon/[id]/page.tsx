"use client";
import "@/style/pages/pokemon.css";
import Image from "next/image";
import { use } from "react";
import { notFound } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BasicInfo } from "./_components/BasicInfo";
import { Evolution } from "./_components/Evolution";
import { ImageGallery } from "./_components/ImageGallery";
import { usePokemonDetail } from "@/hooks/usePokemonDetail";

// 포켓몬 상세 메인 컴포넌트
export default function PokemonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pokemonData = usePokemonDetail(id);

  // 로딩 상태
  if (pokemonData.loading) {
    return <Loading text="포켓몬 정보를 불러오는 중..." />;
  }

  // 에러 또는 데이터 없음
  if (pokemonData.error || !pokemonData.pokemon) {
    return notFound();
  }

  const {
    pokemon,
    koreanName,
    basicInfo,
    pokemonStats,
    typeColors,
    localizedTypes,
    evolutionTree,
    evolutionValidation,
    representativeSprites,
    evolutionData,
  } = pokemonData;

  const officialArtwork =
    pokemon.sprites.other?.["official-artwork"]?.front_default;

  return (
    <ScrollArea className="poke-details-scroll">
      <article className="w-full">
        <Card className="poke-details">
          {/* header */}
          <CardHeader className="w-full">
            {/* 이름, 메인 이미지 */}
            <CardTitle className="poke-details-title">
              <h2 className="poke-details-title__ko">
                <span>#{pokemon.id}</span>
                {koreanName}
              </h2>
              <span className="poke-details-title__en">({pokemon.name})</span>
            </CardTitle>
            {officialArtwork && (
              <div className="poke-details-image">
                <Image
                  priority
                  width={300}
                  height={300}
                  src={officialArtwork}
                  alt={`${pokemon.name} official artwork`}
                  className="object-contain drop-shadow-lg"
                />
              </div>
            )}
            {/* 갤러리 */}
            {representativeSprites && representativeSprites.length > 0 && (
              <ImageGallery images={representativeSprites} />
            )}
          </CardHeader>
          {/* content */}
          <CardContent className="poke-details-content">
            {/* 기본 정보 */}
            {basicInfo && (
              <BasicInfo
                stats={pokemonStats}
                basicInfo={basicInfo}
                typeColors={typeColors || []}
                localizedTypes={localizedTypes || []}
              />
            )}
            {/* 진화트리 */}
            {evolutionTree && (
              <Evolution
                evolutionTree={evolutionTree}
                evolutionData={evolutionData}
                currentPokemonName={pokemon.name}
                evolutionValidation={evolutionValidation}
              />
            )}
          </CardContent>
        </Card>
      </article>
    </ScrollArea>
  );
}
