import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterCheckboxGroupProps } from "@/constants/pokemon";

// 체크 그룹 메인 컴포넌트
export const FilterCheckboxGroup = ({
  title,
  items,
  selectedItems,
  setSelectedItems,
}: FilterCheckboxGroupProps) => {
  // 셀렉트 함수
  const handleItemChange = useCallback(
    (itemKey: string) => {
      setSelectedItems((prev: string[]) => {
        if (prev.includes(itemKey)) {
          return prev.filter((item) => item !== itemKey);
        } else {
          return [...prev, itemKey];
        }
      });
    },
    [setSelectedItems]
  );

  return (
    <>
      <h3 className="poke-dex-filter__title">{title}</h3>
      <div className="poke-dex-filter__group">
        {items.map((item) => (
          <div className="poke-dex-filter__checkbox" key={item.key}>
            <Checkbox
              id={`${title.toLowerCase()}-${item.key}`}
              checked={selectedItems.includes(item.key)}
              onCheckedChange={() => handleItemChange(item.key)}
            />
            <label htmlFor={`${title.toLowerCase()}-${item.key}`}>
              {item.label}
            </label>
          </div>
        ))}
      </div>
    </>
  );
};
