declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"cmu-computer-vision.md": {
	id: "cmu-computer-vision.md";
  slug: "cmu-computer-vision";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"cmu-deep-learning.md": {
	id: "cmu-deep-learning.md";
  slug: "cmu-deep-learning";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"freelancing-journey.md": {
	id: "freelancing-journey.md";
  slug: "freelancing-journey";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"mechanical-to-swe-internship.md": {
	id: "mechanical-to-swe-internship.md";
  slug: "mechanical-to-swe-internship";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"software-rotational-programs.md": {
	id: "software-rotational-programs.md";
  slug: "software-rotational-programs";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"yc-double-interview.md": {
	id: "yc-double-interview.md";
  slug: "yc-double-interview";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
};
"experience": {
"asml-robotics-intern.md": {
	id: "asml-robotics-intern.md";
  slug: "asml-robotics-intern";
  body: string;
  collection: "experience";
  data: any
} & { render(): Render[".md"] };
"nvidia-cad-intern.md": {
	id: "nvidia-cad-intern.md";
  slug: "nvidia-cad-intern";
  body: string;
  collection: "experience";
  data: any
} & { render(): Render[".md"] };
"tesla-software-intern-2022.md": {
	id: "tesla-software-intern-2022.md";
  slug: "tesla-software-intern-2022";
  body: string;
  collection: "experience";
  data: any
} & { render(): Render[".md"] };
"tesla-software-intern-2023.md": {
	id: "tesla-software-intern-2023.md";
  slug: "tesla-software-intern-2023";
  body: string;
  collection: "experience";
  data: any
} & { render(): Render[".md"] };
"toyota.md": {
	id: "toyota.md";
  slug: "toyota";
  body: string;
  collection: "experience";
  data: any
} & { render(): Render[".md"] };
};
"project": {
"3d-scaffolding-tool.md": {
	id: "3d-scaffolding-tool.md";
  slug: "3d-scaffolding-tool";
  body: string;
  collection: "project";
  data: any
} & { render(): Render[".md"] };
"baseball-analytics.md": {
	id: "baseball-analytics.md";
  slug: "baseball-analytics";
  body: string;
  collection: "project";
  data: any
} & { render(): Render[".md"] };
"biorobotics.md": {
	id: "biorobotics.md";
  slug: "biorobotics";
  body: string;
  collection: "project";
  data: any
} & { render(): Render[".md"] };
"efficient-3D-point-cloud-processing.md": {
	id: "efficient-3D-point-cloud-processing.md";
  slug: "efficient-3d-point-cloud-processing";
  body: string;
  collection: "project";
  data: any
} & { render(): Render[".md"] };
"forge-engine.md": {
	id: "forge-engine.md";
  slug: "forge-engine";
  body: string;
  collection: "project";
  data: any
} & { render(): Render[".md"] };
"lidar-maze-robot.md": {
	id: "lidar-maze-robot.md";
  slug: "lidar-maze-robot";
  body: string;
  collection: "project";
  data: any
} & { render(): Render[".md"] };
"strandbeest-robot.md": {
	id: "strandbeest-robot.md";
  slug: "strandbeest-robot";
  body: string;
  collection: "project";
  data: any
} & { render(): Render[".md"] };
};
"research": {
"echocardiagram-ml.md": {
	id: "echocardiagram-ml.md";
  slug: "echocardiagram-ml";
  body: string;
  collection: "research";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = never;
}
