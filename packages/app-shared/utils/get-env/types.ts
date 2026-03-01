import z from "zod";

/** Any object schema accepted by `createGetEnv`. */
export type AnyObjectSchema = z.ZodObject<z.ZodRawShape>;
type AnyZodSchema = z.ZodTypeAny;

/** Optional source object used instead of `process.env`. */
export type EnvSource = Record<string, unknown>;

/**
 * Internal marker attached to schema instances.
 * We use this symbol to recover the original env key after chained transforms.
 */
export const InjectedKeySymbol = Symbol("injected-env-key");

/**
 * Lightweight hover prettifier for DX.
 * Kept local to avoid pulling in heavier utility type machinery.
 */
type Prettify<T> = T extends object ? { [K in keyof T]: T[K] } & {} : T;

/**
 * Selector input shape exposed to callers.
 * Publicly this still feels like regular Zod fields, with hidden key metadata.
 *
 * @param Shape - The shape of the object schema.
 * @returns The injected shape.
 */
export type InjectedShape<Shape extends z.ZodRawShape> = {
	[Key in keyof Shape & string]: Shape[Key] & {
		readonly [InjectedKeySymbol]: Key;
	};
};

/**
 * Limits recursive type traversal depth.
 * This keeps type resolution bounded when traversing deeply nested schema defs.
 */
type RecursionBudget = readonly [1, 1, 1, 1, 1, 1, 1, 1];

/** Moves recursion budget one step forward. */
type ShiftBudget<Budget extends readonly unknown[]> = Budget extends readonly [unknown, ...infer Rest]
	? Rest
	: readonly [];

/**
 * Type-level key extraction from a selected schema entry.
 *
 * @param Schema - The schema to extract the key from.
 * @returns The extracted key.
 */
export type ExtractInjectedKey<Schema, Budget extends readonly unknown[] = RecursionBudget> = Budget extends readonly []
	? never
	: Schema extends { readonly [InjectedKeySymbol]: infer Key extends string }
		? Key
		: Schema extends { readonly def: infer Def }
			? ExtractInjectedKeyFromDef<Def, ShiftBudget<Budget>>
			: never;

/** Collects potential child schema nodes referenced by a schema `def` object. */
type DefChildNodes<Def> =
	| (Def extends { innerType: infer Inner } ? Inner : never)
	| (Def extends { schema: infer Inner } ? Inner : never)
	| (Def extends { type: infer Inner } ? Inner : never)
	| (Def extends { in: infer In } ? In : never)
	| (Def extends { out: infer Out } ? Out : never)
	| (Def extends { left: infer Left } ? Left : never)
	| (Def extends { right: infer Right } ? Right : never)
	| (Def extends { options: readonly (infer Option)[] } ? Option : never);

/**
 * Type-level `def` traversal.
 *
 * This mirrors runtime behavior while avoiding deeply nested conditional chains:
 * we first compute child nodes, then recurse once.
 */
export type ExtractInjectedKeyFromDef<Def, Budget extends readonly unknown[] = RecursionBudget> = ExtractInjectedKey<
	DefChildNodes<Def>,
	Budget
>;

/** Last-write-wins merge used to model duplicate key selection behavior. */
type MergeShape<Left, Right> = Omit<Left, keyof Right> & Right;

/** Single selected entry converted to its keyed schema record. */
type SelectedEntryShape<Entry> = Entry extends AnyZodSchema
	? Record<ExtractInjectedKey<Entry>, Entry>
	: // eslint-disable-next-line @typescript-eslint/no-empty-object-type
		{};

/** Tuple reducer that produces the selected object shape with overwrite semantics. */
type BuildSelectedShape<
	Selected extends readonly unknown[],
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	Acc extends Record<string, unknown> = {},
> = Selected extends readonly [infer Head, ...infer Tail]
	? BuildSelectedShape<Tail, MergeShape<Acc, SelectedEntryShape<Head>>>
	: Acc;

/** Normalizes the reduced shape into a valid Zod raw shape. */
type SelectedRawShape<Selected extends readonly unknown[]> = {
	[Key in keyof BuildSelectedShape<Selected> as Key extends string ? Key : never]: Extract<
		BuildSelectedShape<Selected>[Key],
		AnyZodSchema
	>;
};

/**
 * Final return type from a selector call.
 *
 * @param Schema - The schema to extract the output from.
 * @param Selected - The selected entries to extract the output from.
 * @returns The extracted output.
 */
export type SelectedEnvOutput<Selected extends readonly unknown[]> = z.output<z.ZodObject<SelectedRawShape<Selected>>>;

/**
 * Keys whose selected output is compatible with the original env field type.
 *
 * Compatible keys can safely preserve interface-authored JSDoc and keep
 * transformed output types sound.
 */
type CompatibleDocKeys<Output, EnvDocShape extends object> = {
	[Key in keyof Output & keyof EnvDocShape]: [Output[Key]] extends [EnvDocShape[Key]] ? Key : never;
}[keyof Output & keyof EnvDocShape];

/**
 * Selected output enriched with docs from an optional env interface.
 *
 * When a selected field's output type is compatible with the original field
 * type, we intersect in the source interface field so editors can surface that
 * field's JSDoc in hovers and completions.
 */
type SelectedEnvOutputWithDocs<Selected extends readonly unknown[], EnvDocShape extends object> = Prettify<
	SelectedEnvOutput<Selected> & Pick<EnvDocShape, CompatibleDocKeys<SelectedEnvOutput<Selected>, EnvDocShape>>
>;

/**
 * Bound variant returned by `createGetEnv(schema)`.
 *
 * @param Schema - The schema to get the environment from.
 * @param Selected - The selected entries to get the environment from.
 * @returns The extracted environment.
 */
export type BoundGetEnv<Schema extends AnyObjectSchema, EnvDocShape extends object = z.output<Schema>> = <
	const Selected extends readonly unknown[],
>(
	select: (env: InjectedShape<Schema["shape"]>) => Selected,
	source?: EnvSource,
) => SelectedEnvOutputWithDocs<Selected, EnvDocShape>;

/**
 * Unbound variant returned by `createGetEnv()`.
 *
 * @param Schema - The schema to get the environment from.
 * @param Selected - The selected entries to get the environment from.
 * @returns The extracted environment.
 */
export type UnboundGetEnv = <
	const Schema extends AnyObjectSchema,
	const Selected extends readonly unknown[],
	EnvDocShape extends object = z.output<Schema>,
>(
	schema: Schema,
	select: (env: InjectedShape<Schema["shape"]>) => Selected,
	source?: EnvSource,
) => SelectedEnvOutputWithDocs<Selected, EnvDocShape>;

/** Runtime representation of a possibly injected schema node. */
export type RuntimeInjectedSchema = z.ZodTypeAny & {
	[InjectedKeySymbol]?: string;
};

/** Shared runtime object type for traversal internals. */
export type UnknownObject = Record<PropertyKey, unknown>;
