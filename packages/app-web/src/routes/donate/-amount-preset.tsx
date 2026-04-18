import { Field, FieldTitle } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { memo } from "react";

export interface DonationPresetOption {
	value: string;
	label: string;
	ariaLabel: string;
}

export const DonationPresetSelector = memo(function DonationPresetSelector({
	selectedPreset,
	onValueChange,
	options,
}: {
	selectedPreset: string;
	onValueChange: (value: string) => void;
	options: readonly DonationPresetOption[];
}) {
	return (
		<Field>
			<FieldTitle className="sr-only">Preset amounts</FieldTitle>
			<ToggleGroup
				type="single"
				variant="outline"
				size="lg"
				spacing={2}
				value={selectedPreset || undefined}
				onValueChange={onValueChange}
				className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
				{options.map((preset) => (
					<ToggleGroupItem
						key={preset.value}
						value={preset.value}
						aria-label={preset.ariaLabel}
						className="h-11 w-full rounded-xl text-base font-semibold">
						{preset.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</Field>
	);
});
