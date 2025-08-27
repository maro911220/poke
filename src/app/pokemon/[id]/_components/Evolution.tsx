import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  EvolutionProps,
  EvolutionTreeProps,
  EvolutionCardProps,
} from "@/constants/pokemon";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

//  진화 메인 컴포넌트
export const Evolution = ({
  evolutionTree,
  currentPokemonName,
  evolutionValidation,
  evolutionData,
}: EvolutionProps) => {
  if (
    !evolutionValidation?.containsPokemon ||
    !evolutionValidation?.hasEvolutions ||
    evolutionData === undefined ||
    !evolutionTree
  ) {
    return null;
  }

  return (
    <div className="mt-12">
      <p className="text-lg mb-2">진화트리</p>
      <ScrollArea className="poke-evolution">
        <div className="poke-evolution-list">
          <EvolutionTreeNode
            evolutionTree={evolutionTree}
            currentPokemonName={currentPokemonName}
            evolutionData={evolutionData}
          />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

// 진화 트리 컴포넌트
function EvolutionTreeNode({
  evolutionTree,
  currentPokemonName,
  evolutionData,
}: EvolutionTreeProps) {
  const hasEvolutions = evolutionTree.evolutions.length > 0;
  const isCurrentPokemon = evolutionTree.pokemon.name === currentPokemonName;
  const hasMultipleBranches = evolutionTree.evolutions.length >= 2;

  return (
    <>
      <EvolutionCard
        pokemonName={evolutionTree.pokemon.name}
        isActive={isCurrentPokemon}
        cardData={evolutionData[evolutionTree.pokemon.name]}
      />

      {hasEvolutions && (
        <div
          className={cn(
            "poke-evolution-list__sub",
            hasMultipleBranches && "poke-evolution-list__sub--multiple-branches"
          )}
        >
          {evolutionTree.evolutions.map((subTree) => (
            <EvolutionTreeNode
              key={subTree.pokemon.name}
              evolutionTree={subTree}
              currentPokemonName={currentPokemonName}
              evolutionData={evolutionData}
            />
          ))}
        </div>
      )}
    </>
  );
}

// 카드 컴포넌트
function EvolutionCard({
  pokemonName,
  isActive,
  cardData,
}: EvolutionCardProps) {
  // 데이터 없는 경우
  if (!cardData) return null;

  return (
    <Link href={`/pokemon/${cardData.id}`}>
      <Card
        className={cn(
          "poke-details-gallery__card",
          isActive && "border-blue-400"
        )}
      >
        <Image
          src={cardData.imageUrl}
          alt={pokemonName}
          width={72}
          height={72}
        />
        <p>{cardData.koreanName}</p>
      </Card>
    </Link>
  );
}
