import { Field, FieldTitle } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { memo } from "react";

export interface DonationPresetOption {
	value: string;
	label: string;
	cupLabel: string;
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
						className="h-11 w-full rounded-xl px-3 text-base font-semibold">
						<span className="flex min-w-0 items-center justify-center gap-2">
							<span>{preset.label}</span>
							<span className="text-muted-foreground/70 text-[0.68rem] font-normal">{preset.cupLabel}</span>
						</span>
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</Field>
	);
});
