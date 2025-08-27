import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  PokeStats,
  PokeBasicInfo,
  BasicInfoProps,
  STAT_MAX_VALUES,
} from "@/constants/pokemon";

// 기본정보 메인 컴포넌트
export const BasicInfo = ({
  stats,
  basicInfo,
  typeColors,
  localizedTypes,
}: BasicInfoProps) => {
  const totalStats = stats?.reduce((acc, stat) => acc + stat.value, 0) || 0;

  return (
    <div className="space-y-6">
      {/* 기본 정보 섹션 */}
      <div className="poke-info">
        <InfoBox title="키">
          <p>{basicInfo.height} m</p>
        </InfoBox>
        <InfoBox title="무게">
          <p>{basicInfo.weight} kg</p>
        </InfoBox>
        <InfoBox title="타입">
          {localizedTypes.map((type, index) => (
            <TypeTag
              key={`${type}-${index}`}
              type={type}
              color={typeColors[index]}
            />
          ))}
        </InfoBox>
        <InfoBox title="특성">
          {basicInfo.abilities.map((ability) => (
            <AbilityTag key={ability.ability.name} ability={ability} />
          ))}
        </InfoBox>
      </div>
      {/* 능력치 섹션 */}
      {stats && stats.length > 0 && (
        <div className="poke-info-box">
          <h2 className="poke-info-box__title">능력치</h2>
          <ul className="poke-info-stats">
            {stats.map((stat) => (
              <StatItem key={stat.originalName} stat={stat} />
            ))}
            <TotalStats total={totalStats} />
          </ul>
        </div>
      )}
    </div>
  );
};

// 박스 컴포넌트
const InfoBox = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="poke-info-box">
    <p className="poke-info-box__title">{title}</p>
    <div className="poke-info-box__value">{children}</div>
  </div>
);

// 타입 태그 컴포넌트
const TypeTag = ({ type, color }: { type: string; color: string }) => (
  <span
    style={{ backgroundColor: color }}
    className="text-white poke-info-box__label"
  >
    {type}
  </span>
);

// 특성 태그 컴포넌트
const AbilityTag = ({
  ability,
}: {
  ability: PokeBasicInfo["abilities"][0];
}) => (
  <span
    className={cn(
      "poke-info-box__label",
      ability.is_hidden && "text-white bg-rose-400"
    )}
  >
    {ability.ability.koreanName || ability.ability.name}
  </span>
);

// 능력치 아이템 컴포넌트
const StatItem = ({ stat }: { stat: PokeStats }) => {
  const maxValue = STAT_MAX_VALUES[stat.name] || STAT_MAX_VALUES.default;
  const progress = Math.min((stat.value / maxValue) * 100, 100);

  return (
    <li className="poke-info-stats__item">
      <span>{stat.name}</span>
      <Progress value={progress} className="sm:flex-1 flex-none" />
      <span className="text-right min-w-[2rem]">{stat.value}</span>
    </li>
  );
};

// 총합 능력치 컴포넌트
const TotalStats = ({ total }: { total: number }) => (
  <li className="poke-info-stats__item text-lg">
    <span>총합</span>
    <span className="text-right">{total}</span>
  </li>
);
