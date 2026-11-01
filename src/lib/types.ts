export type HighlightColor = 'info' | 'success' | 'warning' | 'error';

export interface HashFormulaStep {
  key: string;
  hashCode?: number;
  spread?: number;
  index?: number;
  capacity?: number;
}

export interface Highlight {
  indices?: number[];
  nodeIds?: string[];
  color?: HighlightColor;
  hashFormula?: HashFormulaStep;
}

export interface ArrayState {
  kind: 'array';
  elements: (string | number | null)[];
  capacity: number;
  indices: boolean;
}

export interface LinkedListNode {
  id: string;
  value: string;
}

export interface LinkedListState {
  kind: 'linked';
  nodes: LinkedListNode[];
  headId: string | null;
  tailId: string | null;
}

export interface HashEntry {
  key: string;
  value?: string;
  hash: number;
}

export interface HashBucket {
  index: number;
  entries: HashEntry[];
  collision: boolean;
  treeified?: boolean;
}

export interface HashState {
  kind: 'hash';
  buckets: HashBucket[];
  capacity: number;
}

export interface TreeNode {
  id: string;
  key: string;
  value?: string;
  color: 'red' | 'black';
  leftId: string | null;
  rightId: string | null;
  parentId: string | null;
}

export interface TreeState {
  kind: 'tree';
  nodes: TreeNode[];
  rootId: string | null;
}

export type VisualState = ArrayState | LinkedListState | HashState | TreeState;

export interface Frame {
  step: number;
  description: string;
  state: VisualState;
  highlight?: Highlight;
  pseudoCode?: {
    lines: string[];
    activeLine: number;
  };
}

export interface OperationParam {
  name: string;
  type: 'number' | 'string';
  label: string;
  default: number | string;
  min?: number;
  max?: number;
}

export interface OperationDefinition {
  slug: string;
  signature: string;
  title: string;
  description: string;
  complexity: string;
  params: OperationParam[];
  codeSample: string;
  initialState?: () => VisualState;
  buildFrames: (state: any, params: Record<string, any>) => Frame[];
}

export interface TheoryContent {
  what: string;
  internals: string;
  whenToUse: string;
  complexity: { op: string; bigO: string }[];
  codeSample: string;
  pros?: string[];
  cons?: string[];
  commonMistakes?: string[];
  comparison?: { name: string; note: string }[];
  keyTakeaways?: string[];
}

export interface CollectionDefinition {
  slug: string;
  name: string;
  javaInterface: string;
  shortDescription: string;
  icon: string;
  category: 'list' | 'set' | 'map' | 'queue';
  priority: 'mvp' | 'phase2';
  initialState: () => VisualState;
  theory: TheoryContent;
  operations: OperationDefinition[];
}