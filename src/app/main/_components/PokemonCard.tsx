import Link from "next/link";
import Image from "next/image";
import type { Pokemon } from "@/constants/pokemon";
import { POKEMON_TYPES } from "@/constants/pokemon";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// 카드 메인 컴포넌트
export const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => {
  return (
    <Link key={pokemon.id} href={`/pokemon/${pokemon.id}`}>
      <Card className="poke-card">
        <CardHeader className="poke-card-header">
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            width={96}
            height={96}
            loading="lazy"
          />
          <CardTitle className="poke-card-header__title">
            {pokemon.koreanName}
            <p className="poke-card-header__eng">{pokemon.name}</p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="poke-card-id">#{pokemon.id}</p>
          <div className="poke-card-types">
            {pokemon.types.map((type) => {
              const typeInfo =
                POKEMON_TYPES[type as keyof typeof POKEMON_TYPES];

              return (
                <span key={type} style={{ backgroundColor: typeInfo?.color }}>
                  {typeInfo.name}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
