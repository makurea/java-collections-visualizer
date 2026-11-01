import type {
  CollectionDefinition,
  Frame,
  TreeState,
  TreeNode,
} from '../lib/types';

// ---------- внутренняя модель RB-дерева ----------
interface RawNode {
  id: string;
  key: string;
  value: string;
  color: 'red' | 'black';
  left: RawNode | null;
  right: RawNode | null;
  parent: RawNode | null;
}

function makeNode(key: string, value: string, color: 'red' | 'black' = 'red'): RawNode {
  return { id: key, key, value, color, left: null, right: null, parent: null };
}

function cloneTree(n: RawNode | null, parent: RawNode | null = null): RawNode | null {
  if (!n) return null;
  const copy: RawNode = { ...n, parent, left: null, right: null };
  copy.left = cloneTree(n.left, copy);
  copy.right = cloneTree(n.right, copy);
  return copy;
}

function toState(root: RawNode | null): TreeState {
  const nodes: TreeNode[] = [];
  function walk(n: RawNode | null) {
    if (!n) return;
    nodes.push({
      id: n.id,
      key: n.key,
      value: n.value,
      color: n.color,
      leftId: n.left?.id ?? null,
      rightId: n.right?.id ?? null,
      parentId: n.parent?.id ?? null,
    });
    walk(n.left);
    walk(n.right);
  }
  walk(root);
  return { kind: 'tree', nodes, rootId: root?.id ?? null };
}

function findNode(root: RawNode | null, key: string): RawNode | null {
  let cur = root;
  while (cur) {
    if (cur.key === key) return cur;
    cur = key < cur.key ? cur.left : cur.right;
  }
  return null;
}

function rotateLeft(root: RawNode, x: RawNode): RawNode {
  const y = x.right!;
  x.right = y.left;
  if (y.left) y.left.parent = x;
  y.parent = x.parent;
  if (!x.parent) root = y;
  else if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;
  y.left = x;
  x.parent = y;
  return root;
}

function rotateRight(root: RawNode, y: RawNode): RawNode {
  const x = y.left!;
  y.left = x.right;
  if (x.right) x.right.parent = y;
  x.parent = y.parent;
  if (!y.parent) root = x;
  else if (y === y.parent.right) y.parent.right = x;
  else y.parent.left = x;
  x.right = y;
  y.parent = x;
  return root;
}

function insertFixup(root: RawNode, z: RawNode, log: string[]): RawNode {
  while (z.parent && z.parent.color === 'red') {
    const gp = z.parent.parent;
    if (!gp) break;
    if (z.parent === gp.left) {
      const uncle = gp.right;
      if (uncle && uncle.color === 'red') {
        log.push(`Дядя (${uncle.key}) тоже красный → перекрашиваем родителя, дядю в чёрный, деда в красный.`);
        z.parent.color = 'black';
        uncle.color = 'black';
        gp.color = 'red';
        z = gp;
      } else {
        if (z === z.parent.right) {
          log.push(`Дядя чёрный/нет, зигзаг → левый поворот вокруг родителя (${z.parent.key}).`);
          z = z.parent;
          root = rotateLeft(root, z);
        }
        log.push(`Перекрашиваем и делаем правый поворот вокруг деда (${z.parent!.parent!.key}).`);
        z.parent!.color = 'black';
        z.parent!.parent!.color = 'red';
        root = rotateRight(root, z.parent!.parent!);
      }
    } else {
      const uncle = gp.left;
      if (uncle && uncle.color === 'red') {
        log.push(`Дядя (${uncle.key}) тоже красный → перекрашиваем.`);
        z.parent.color = 'black';
        uncle.color = 'black';
        gp.color = 'red';
        z = gp;
      } else {
        if (z === z.parent.left) {
          log.push(`Дядя чёрный/нет, зигзаг → правый поворот вокруг родителя (${z.parent.key}).`);
          z = z.parent;
          root = rotateRight(root, z);
        }
        log.push(`Перекрашиваем и делаем левый поворот вокруг деда (${z.parent!.parent!.key}).`);
        z.parent!.color = 'black';
        z.parent!.parent!.color = 'red';
        root = rotateLeft(root, z.parent!.parent!);
      }
    }
  }
  root.color = 'black';
  return root;
}

// ---------- начальное дерево ----------
function initialState(): TreeState {
  // Построим валидное RB-дерево вручную для красоты
  //                M (black)
  //              /          \
  //          F (red)         T (red)
  //         /    \          /    \
  //      C (blk) E (blk)  Q (blk) W (blk)
  const M = makeNode('M', '12', 'black');
  const F = makeNode('F', '6', 'red');
  const T = makeNode('T', '20', 'red');
  const C = makeNode('C', '3', 'black');
  const E = makeNode('E', '5', 'black');
  const Q = makeNode('Q', '17', 'black');
  const W = makeNode('W', '23', 'black');
  M.left = F; F.parent = M;
  M.right = T; T.parent = M;
  F.left = C; C.parent = F;
  F.right = E; E.parent = F;
  T.left = Q; Q.parent = T;
  T.right = W; W.parent = T;
  return toState(M);
}

// ---------- коллекция ----------
export const treemap: CollectionDefinition = {
  slug: 'treemap',
  name: 'TreeMap',
  javaInterface: 'Map',
  shortDescription:
    'Красно-чёрное дерево поиска. Ключи хранятся отсортированными, операции O(log n).',
  icon: '🌳',
  category: 'map',
  priority: 'phase2',
  initialState,
  theory: {
  what: `TreeMap — реализация Map на основе красно-чёрного дерева поиска. В отличие от HashMap, ключи в TreeMap всегда упорядочены: либо по natural ordering (если ключи реализуют Comparable), либо по переданному Comparator.

Из-за того что это сбалансированное дерево, все операции — put/get/remove — выполняются за O(log n). Это медленнее HashMap (O(1) в среднем), но даёт то, чего HashMap дать не может: упорядоченность и диапазонные запросы (subMap, headMap, tailMap).`,
  internals: `Красно-чёрное дерево — это BST (binary search tree) с дополнительным свойством: каждый узел покрашен в красный или чёрный цвет, и выполняются 4 инварианта:
1. Корень всегда чёрный;
2. Листья (null) — чёрные;
3. У красного узла оба ребёнка — чёрные (нет двух красных подряд);
4. Чёрная высота — число чёрных узлов на любом пути от корня до листа — одинакова.

Эти инварианты гарантируют, что высота дерева ≤ 2·log₂(n+1), а значит все операции O(log n).

При вставке (put):
1. Идём по дереву от корня, сравнивая ключи через compareTo/comparator;
2. Вставляем новый узел как красный лист;
3. Запускаем fixup: пока родитель красный — перекрашиваем и делаем повороты (rotations) для восстановления инвариантов.

При удалении (remove):
1. Находим узел;
2. Если у него два ребёнка — заменяем на successor (минимальный в правом поддереве);
3. Удаляем как в обычном BST;
4. Запускаем delete-fixup для восстановления баланса.

Повороты (rotateLeft/rotateRight) — это локальные операции O(1), которые перестраивают 3 узла и восстанавливают структуру.`,
  whenToUse: `TreeMap — выбор, когда:
• Ключи должны быть отсортированы (например, для вывода в порядке возрастания);
• Нужны диапазонные запросы: subMap, headMap, tailMap, firstKey, lastKey, floorKey, ceilingKey;
• Нужна навигация по ключам (найти ближайший ключ ≥/≤ заданного).

Не используйте TreeMap, если:
• Порядок не важен — HashMap быстрее;
• Нужен порядок вставки — LinkedHashMap;
• Ключи не Comparable и нет Comparator — получите ClassCastException.`,
  complexity: [
    { op: 'put(K, V)', bigO: 'O(log n)' },
    { op: 'get(K)', bigO: 'O(log n)' },
    { op: 'remove(K)', bigO: 'O(log n)' },
    { op: 'firstKey / lastKey', bigO: 'O(log n)' },
    { op: 'floorKey / ceilingKey', bigO: 'O(log n)' },
    { op: 'subMap(from, to)', bigO: 'O(log n)' },
    { op: 'итерация по порядку', bigO: 'O(n)' },
  ],
  codeSample: `TreeMap<String, Integer> map = new TreeMap<>();

map.put("M", 12);
map.put("F", 6);
map.put("T", 20);
map.put("C", 3);
map.put("E", 5);

// Ключи всегда отсортированы
for (String k : map.keySet()) System.out.print(k + " ");
// C E F M T

map.firstKey();  // "C"
map.lastKey();   // "T"

map.floorKey("G");    // "F" — наибольший ключ ≤ "G"
map.ceilingKey("G");  // "M" — наименьший ключ ≥ "G"

// Диапазон [E, T):
map.subMap("E", "T"); // {E=5, F=6, M=12}

// Свой Comparator:
TreeMap<String, Integer> byLen = new TreeMap<>(Comparator.comparingInt(String::length));
byLen.put("aa", 1);
byLen.put("b", 2);
// порядок: b, aa`,
  pros: [
    'Ключи всегда отсортированы',
    'Диапазонные запросы за O(log n)',
    'Гарантированное O(log n) в худшем случае (не амортизированно)',
    'Навигация: floor, ceiling, higher, lower',
  ],
  cons: [
    'Медленнее HashMap — O(log n) вместо O(1)',
    'Ключи должны быть Comparable или нужен Comparator',
    'Не потокобезопасен',
    'Больше памяти: каждый узел хранит color, left, right, parent',
  ],
  commonMistakes: [
    'Использовать ключи, не реализующие Comparable без Comparator — ClassCastException',
    'Сравнивать через equals вместо compareTo — TreeMap использует compareTo',
    'Ожидать O(1) — это дерево, всегда O(log n)',
    'Использовать null-ключи — TreeMap с natural ordering их не принимает',
    'Забывать, что для TreeMap важен порядок, а не equals',
  ],
  comparison: [
    { name: 'TreeMap', note: 'Красно-чёрное дерево. Отсортированные ключи, O(log n), диапазонные запросы.' },
    { name: 'HashMap', note: 'Хеш-таблица. O(1) в среднем, порядок не важен.' },
    { name: 'LinkedHashMap', note: 'HashMap + порядок вставки. Быстрый, но без сортировки.' },
    { name: 'ConcurrentSkipListMap', note: 'Потокобезопасный аналог TreeMap на skip-list. O(log n), lock-free.' },
  ],
  keyTakeaways: [
    'TreeMap = красно-чёрное дерево поиска',
    'Ключи всегда отсортированы (natural или Comparator)',
    'Все операции O(log n), в отличие от HashMap O(1)',
    'Используется для диапазонных запросов (subMap, headMap, tailMap)',
    'Сравнение идёт через compareTo/comparator, а не через equals',
    'Высота дерева ≤ 2·log₂(n+1) — гарантируется инвариантами RB-tree',
  ],
},
  operations: [
    // ---------- put ----------
    {
      slug: 'put',
      signature: 'V put(K key, V value)',
      title: 'Вставка с балансировкой',
      description:
        'Классическая вставка в BST + fixup: перекраска и повороты для сохранения свойств красно-чёрного дерева.',
      complexity: 'O(log n)',
      params: [
        { name: 'key', type: 'string', label: 'Ключ (1 буква)', default: 'G' },
        { name: 'value', type: 'string', label: 'Значение', default: '7' },
      ],
      codeSample: `TreeMap<String, Integer> map = new TreeMap<>();
map.put("M", 12);
map.put("F", 6);
map.put("G", 7); // вставка + балансировка`,
      buildFrames: (state: TreeState, params: Record<string, any>): Frame[] => {
        const key = String(params.key).trim();
        const value = String(params.value);
        const frames: Frame[] = [];

        // Восстанавливаем RawNode из TreeState
        const map = new Map<string, RawNode>();
        for (const n of state.nodes) {
          map.set(n.id, {
            id: n.id, key: n.key, value: n.value ?? '', color: n.color,
            left: null, right: null, parent: null,
          });
        }
        for (const n of state.nodes) {
          const raw = map.get(n.id)!;
          raw.left = n.leftId ? map.get(n.leftId) ?? null : null;
          raw.right = n.rightId ? map.get(n.rightId) ?? null : null;
          raw.parent = n.parentId ? map.get(n.parentId) ?? null : null;
        }
        let root = state.rootId ? map.get(state.rootId)! : null;

        // snapshot helper
        const snap = (desc: string, hl?: any) => {
          frames.push({
            step: frames.length + 1,
            description: desc,
            state: toState(root),
            highlight: hl,
          });
        };

        snap(`Исходное дерево. Вставляем ключ "${key}" → "${value}".`);

        if (!key) {
          snap('Пустой ключ — прерываем.');
          return frames;
        }

        // Поиск места вставки
        if (!root) {
          root = makeNode(key, value, 'black');
          snap(`Дерево было пусто — новый узел "${key}" становится чёрным корнем.`, {
            nodeIds: [key], color: 'success',
          });
          return frames;
        }

        let cur: RawNode | null = root;
        const path: string[] = [];
        while (cur) {
          path.push(cur.id);
          snap(`Сравниваем "${key}" с "${cur.key}": ${key < cur.key ? 'идём влево' : key > cur.key ? 'вправо' : 'равно!'}`, {
            nodeIds: [...path], color: 'info',
          });
          if (key === cur.key) {
            cur.value = value;
            snap(`Ключ "${key}" уже есть — заменяем значение на "${value}".`, {
              nodeIds: [cur.id], color: 'success',
            });
            return frames;
          }
          if (key < cur.key) {
            if (!cur.left) break;
            cur = cur.left;
          } else {
            if (!cur.right) break;
            cur = cur.right;
          }
        }

        // Вставляем как красный лист
        const z = makeNode(key, value, 'red');
        z.parent = cur;
        if (key < cur!.key) cur!.left = z;
        else cur!.right = z;

        snap(`Создаём красный узел "${key}" и присоединяем ${key < cur!.key ? 'слева' : 'справа'} от "${cur!.key}".`, {
          nodeIds: [z.id], color: 'warning',
        });

        // Fixup
        const log: string[] = [];
        const beforeRoot = root;
        root = insertFixup(root!, z, log);

        for (const line of log) {
          snap(line, { nodeIds: [z.id], color: 'warning' });
        }

        snap(`Готово. Корень "${root!.key}" всегда чёрный. Дерево сбалансировано.`, {
          nodeIds: [z.id], color: 'success',
        });

        return frames;
      },
    },

    // ---------- get ----------
    {
      slug: 'get',
      signature: 'V get(Object key)',
      title: 'Поиск по ключу',
      description:
        'Спускаемся от корня: на каждом шаге сравниваем ключ и идём влево или вправо. Глубина ≤ 2·log₂(n+1).',
      complexity: 'O(log n)',
      params: [{ name: 'key', type: 'string', label: 'Ключ (1 буква)', default: 'E' }],
      codeSample: `TreeMap<String, Integer> map = new TreeMap<>();
map.put("M", 12);
map.put("F", 6);
Integer v = map.get("F"); // 6`,
      buildFrames: (state: TreeState, params: Record<string, any>): Frame[] => {
        const key = String(params.key).trim();
        const frames: Frame[] = [];

        const map = new Map<string, RawNode>();
        for (const n of state.nodes) {
          map.set(n.id, {
            id: n.id, key: n.key, value: n.value ?? '', color: n.color,
            left: null, right: null, parent: null,
          });
        }
        for (const n of state.nodes) {
          const raw = map.get(n.id)!;
          raw.left = n.leftId ? map.get(n.leftId) ?? null : null;
          raw.right = n.rightId ? map.get(n.rightId) ?? null : null;
          raw.parent = n.parentId ? map.get(n.parentId) ?? null : null;
        }
        let cur = state.rootId ? map.get(state.rootId)! : null;

        frames.push({
          step: 1,
          description: `Ищем "${key}". Начинаем с корня: "${cur?.key ?? '—'}".`,
          state,
          highlight: cur ? { nodeIds: [cur.id], color: 'info' } : { color: 'error' },
        });

        const path: string[] = [];
        let steps = 0;
        while (cur) {
          path.push(cur.id);
          steps++;
          if (key === cur.key) {
            frames.push({
              step: frames.length + 1,
              description: `Совпадение! "${key}" = "${cur.value}". Найдено за ${steps} шаг(ов).`,
              state,
              highlight: { nodeIds: [...path], color: 'success' },
            });
            return frames;
          }
          const dir = key < cur.key ? 'влево' : 'вправо';
          frames.push({
            step: frames.length + 1,
            description: `"${key}" ${key < cur.key ? '<' : '>'} "${cur.key}" → идём ${dir}.`,
            state,
            highlight: { nodeIds: [...path], color: 'info' },
          });
          cur = key < cur.key ? cur.left : cur.right;
        }

        frames.push({
          step: frames.length + 1,
          description: `Дошли до null. Ключа "${key}" нет — возвращаем null.`,
          state,
          highlight: { nodeIds: path, color: 'error' },
        });

        return frames;
      },
    },

    // ---------- remove (упрощённый) ----------
    {
      slug: 'remove',
      signature: 'V remove(Object key)',
      title: 'Удаление',
      description:
        'Находим узел, удаляем как в BST (замена на successor для двух детей). Полная RB-балансировка после удаления упрощена в демо.',
      complexity: 'O(log n)',
      params: [{ name: 'key', type: 'string', label: 'Ключ (1 буква)', default: 'F' }],
      codeSample: `TreeMap<String, Integer> map = new TreeMap<>();
map.put("M", 12);
map.put("F", 6);
map.remove("F");`,
      buildFrames: (state: TreeState, params: Record<string, any>): Frame[] => {
        const key = String(params.key).trim();
        const frames: Frame[] = [];

        const map = new Map<string, RawNode>();
        for (const n of state.nodes) {
          map.set(n.id, {
            id: n.id, key: n.key, value: n.value ?? '', color: n.color,
            left: null, right: null, parent: null,
          });
        }
        for (const n of state.nodes) {
          const raw = map.get(n.id)!;
          raw.left = n.leftId ? map.get(n.leftId) ?? null : null;
          raw.right = n.rightId ? map.get(n.rightId) ?? null : null;
          raw.parent = n.parentId ? map.get(n.parentId) ?? null : null;
        }
        let root = state.rootId ? map.get(state.rootId)! : null;

        const snap = (desc: string, hl?: any) =>
          frames.push({ step: frames.length + 1, description: desc, state: toState(root), highlight: hl });

        snap(`Удаляем ключ "${key}".`);

        const node = findNode(root, key);
        if (!node) {
          snap(`Ключ "${key}" не найден.`, { color: 'error' });
          return frames;
        }

        snap(`Нашли узел "${key}".`, { nodeIds: [node.id], color: 'warning' });

        let toRemove = node;
        if (node.left && node.right) {
          let succ = node.right;
          while (succ.left) succ = succ.left;
          snap(`У узла два ребёнка. Находим successor — минимальный в правом поддереве: "${succ.key}".`, {
            nodeIds: [node.id, succ.id], color: 'warning',
          });
          node.key = succ.key;
          node.value = succ.value;
          toRemove = succ;
        }

        const child = toRemove.left ?? toRemove.right;
        if (child) {
          child.parent = toRemove.parent;
        }
        if (!toRemove.parent) root = child;
        else if (toRemove === toRemove.parent.left) toRemove.parent.left = child;
        else toRemove.parent.right = child;

        snap(`Отсоединили узел. Возвращаем "${toRemove.value}".`, { color: 'success' });

        if (root && root.color === 'red') {
          root.color = 'black';
          snap('Корень перекрашен в чёрный.', { nodeIds: [root.id], color: 'info' });
        }

        return frames;
      },
    },
  ],
};