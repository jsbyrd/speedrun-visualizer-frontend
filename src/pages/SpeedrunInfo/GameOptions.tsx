import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Variable, Category } from "./types";

export type SelectedVariables = {
  [variableId: string]: {
    id: string;
    label: string;
  };
};

type GameOptionsProps = {
  categories: Category[];
  availableVariables: Variable[];
  selectedCategory: string | null;
  selectedVariables: SelectedVariables;
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedVariables: (variables: SelectedVariables) => void;
};

const GameOptions: React.FC<GameOptionsProps> = ({
  categories,
  availableVariables,
  selectedCategory,
  selectedVariables,
  setSelectedCategory,
  setSelectedVariables,
}) => {
  return (
    <div className="mt-4">
      <div className="flex justify-center flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-2 py-1 rounded-md text-sm ${
              selectedCategory === category.id
                ? "bg-gray-600 border border-white text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setSelectedCategory(category.id)}
            style={{ whiteSpace: "nowrap" }}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-center flex-wrap gap-4">
        {availableVariables.map((variable) => (
          <div key={variable.id} className="flex flex-col">
            <label className="block text-md text-white/90 mb-1">
              {variable.name}
            </label>
            <Select
              onValueChange={(valueId) => {
                const selectedValue = variable.values?.values?.[valueId];
                if (selectedValue) {
                  setSelectedVariables({
                    ...selectedVariables,
                    [variable.id]: {
                      id: valueId,
                      label: selectedValue.label,
                    },
                  });
                }
              }}
              value={selectedVariables[variable.id]?.id || ""}
            >
              <SelectTrigger className="w-full text-sm text-white pr-6">
                <SelectValue
                  placeholder={
                    selectedVariables[variable.id]?.label ||
                    `Select ${variable.name}`
                  }
                />
              </SelectTrigger>
              <SelectContent className="text-sm">
                {variable.values?.values &&
                  Object.entries(variable.values.values).map(
                    ([valueId, value]) => (
                      <SelectItem
                        key={valueId}
                        value={valueId}
                        className="text-sm"
                      >
                        {value.label}
                      </SelectItem>
                    )
                  )}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameOptions;
