import type {
  CollectionDefinition,
  Frame,
  HashState,
  HashBucket,
} from '../lib/types';
import { javaStringHash, bucketIndex } from '../lib/utils';

const CAPACITY = 8;

function makeState(keys: string[]): HashState {
  const buckets: HashBucket[] = Array.from({ length: CAPACITY }, (_, i) => ({
    index: i,
    entries: [],
    collision: false,
  }));
  for (const k of keys) {
    const h = javaStringHash(k);
    const idx = bucketIndex(k, CAPACITY);
    buckets[idx].entries.push({ key: k, hash: h });
    if (buckets[idx].entries.length > 1) buckets[idx].collision = true;
  }
  return { kind: 'hash', buckets, capacity: CAPACITY };
}

const initialState = () => makeState(['java', 'python', 'Aa', 'BB']);

const cloneBuckets = (state: HashState): HashBucket[] =>
  state.buckets.map((b) => ({ ...b, entries: b.entries.map((e) => ({ ...e })) }));

export const hashset: CollectionDefinition = {
  slug: 'hashset',
  name: 'HashSet',
  javaInterface: 'Set',
  shortDescription:
    'Множество уникальных элементов на основе HashMap. Не хранит дубликаты, порядок не гарантирован.',
  icon: '🎯',
  category: 'set',
  priority: 'mvp',
  initialState,
  theory: {
  what: `HashSet — это множество уникальных элементов. Внутри HashSet устроен как обёртка над HashMap: элементы множества хранятся как ключи мапы, а значением служит фиктивный объект-заглушка (PRESENT).

Именно поэтому HashSet наследует все свойства HashMap: операции add/contains/remove — O(1) в среднем, порядок не гарантирован, при плохих hashCode возможны коллизии.`,
  internals: `Внутри HashSet есть одно поле:
• private transient HashMap<E, Object> map;

И константа-заглушка:
• private static final Object PRESENT = new Object();

Реализация методов тривиальна:
• add(e)  → return map.put(e, PRESENT) == null;
• remove(o) → return map.remove(o) == PRESENT;
• contains(o) → return map.containsKey(o);

То есть все операции HashSet — это просто делегирование в HashMap. Когда вы добавляете элемент в HashSet, вы на самом деле вызываете put() на внутренней HashMap.

Отсюда следует важное: элемент, добавленный в HashSet, должен иметь корректные hashCode() и equals(). Иначе дубликаты не будут отсекаться, а поиск будет возвращать false для существующих элементов.`,
  whenToUse: `HashSet — идеален, когда:
• Нужно проверять принадлежность элемента множеству за O(1);
• Нужно отсечь дубликаты из коллекции (new HashSet<>(list));
• Порядок не важен;
• Нужна быстрая операция «есть ли такой элемент?» — основная для HashSet.

Не используйте HashSet для сортированного вывода — для этого TreeSet. Для сохранения порядка вставки — LinkedHashSet.`,
  complexity: [
    { op: 'add(E)', bigO: 'O(1) в среднем' },
    { op: 'contains(Object)', bigO: 'O(1) в среднем' },
    { op: 'remove(Object)', bigO: 'O(1) в среднем' },
    { op: 'size()', bigO: 'O(1)' },
    { op: 'итерация', bigO: 'O(n)' },
  ],
  codeSample: `Set<String> set = new HashSet<>();

set.add("java");      // true
set.add("python");    // true
set.add("java");      // false — дубликат
set.contains("java"); // true
set.remove("python"); // true
set.size();           // 1

// Убрать дубликаты из списка:
List<Integer> withDup = List.of(1, 2, 2, 3, 3, 3);
Set<Integer> unique = new HashSet<>(withDup); // [1, 2, 3]

// Пересечение множеств:
Set<String> a = new HashSet<>(Set.of("a", "b", "c"));
Set<String> b = new HashSet<>(Set.of("b", "c", "d"));
a.retainAll(b); // a = [b, c]`,
  pros: [
    'O(1) в среднем для add/contains/remove',
    'Гарантирует уникальность элементов',
    'Простая реализация — обёртка над HashMap',
    'Удобно для отсечения дубликатов и проверки принадлежности',
  ],
  cons: [
    'Нет порядка обхода',
    'Требует корректных hashCode()/equals() у элементов',
    'Не потокобезопасен',
    'Больше памяти, чем у массива (как и HashMap)',
  ],
  commonMistakes: [
    'Добавлять изменяемые объекты — hashCode меняется, элемент «теряется»',
    'Ожидать порядок — его нет, используйте LinkedHashSet',
    'Забыть переопределить hashCode/equals при добавлении своего класса',
    'Использовать Set<Object> для разнородных объектов — путаница',
    'Думать что HashSet = HashMap — под капотом да, но семантика разная',
  ],
  comparison: [
    { name: 'HashSet', note: 'Быстрое множество, без порядка. Стандарт по умолчанию.' },
    { name: 'LinkedHashSet', note: 'Сохраняет порядок вставки. Чуть медленнее, чуть больше памяти.' },
    { name: 'TreeSet', note: 'Отсортированное множество (красно-чёрное дерево). O(log n).' },
    { name: 'EnumSet', note: 'Специализированное множество для enum. Очень быстрое, на битовой маске.' },
    { name: 'CopyOnWriteArraySet', note: 'Потокобезопасное, для read-heavy сценариев.' },
  ],
  keyTakeaways: [
    'HashSet = HashMap с фиктивным значением PRESENT',
    'Все операции делегируются во внутреннюю HashMap',
    'Идеален для уникальности и быстрой проверки принадлежности',
    'Порядка нет — используйте LinkedHashSet или TreeSet если он нужен',
    'Для своих классов — обязательно переопределяйте hashCode/equals',
  ],
},
  operations: [
    // ---------- add ----------
    {
      slug: 'add',
      signature: 'boolean add(E e)',
      title: 'Добавить элемент',
      description:
        'Возвращает true, если элемент добавлен; false, если уже был в множестве.',
      complexity: 'O(1) в среднем',
      params: [{ name: 'value', type: 'string', label: 'Значение', default: 'kotlin' }],
      codeSample: `Set<String> set = new HashSet<>();
set.add("java");    // true
set.add("java");    // false (уже есть)
set.add("python");  // true`,
      buildFrames: (state: HashState, params: Record<string, any>): Frame[] => {
        const key = String(params.value);
        const buckets = cloneBuckets(state);
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Пытаемся добавить "${key}" в множество.`,
          state: { ...state, buckets },
          pseudoCode: {
            lines: [
              'public boolean add(E e) {',
              '  return map.put(e, PRESENT) == null;',
              '}',
            ],
            activeLine: 1,
          },
        });

        const hash = javaStringHash(key);
        const spread = (hash ^ (hash >>> 16)) & 0xffffffff;
        const idx = spread & (state.capacity - 1);
        frames.push({
          step: 2,
          description: `hashCode("${key}") = ${hash}. Индекс бакета: ${spread} & ${state.capacity - 1} = ${idx}.`,
          state: { ...state, buckets },
          highlight: { indices: [idx], color: 'info' },
        });

        const bucket = buckets[idx];
        const exists = bucket.entries.some((e) => e.key === key);
        if (exists) {
          frames.push({
            step: 3,
            description: `Элемент "${key}" уже есть в бакете ${idx}. Возвращаем false (дубликат).`,
            state: { ...state, buckets },
            highlight: { indices: [idx], color: 'error' },
          });
          return frames;
        }

        bucket.entries.push({ key, hash });
        bucket.collision = bucket.entries.length > 1;
        frames.push({
          step: 3,
          description: `Элемента нет — вставляем "${key}" в бакет ${idx}. Возвращаем true.`,
          state: { ...state, buckets },
          highlight: { indices: [idx], color: 'success' },
        });

        return frames;
      },
    },

    // ---------- contains ----------
    {
      slug: 'contains',
      signature: 'boolean contains(Object o)',
      title: 'Содержит элемент?',
      description: 'Проверка наличия через hashCode + equals. O(1) в среднем.',
      complexity: 'O(1) в среднем',
      params: [{ name: 'value', type: 'string', label: 'Значение', default: 'java' }],
      codeSample: `Set<String> set = new HashSet<>(Set.of("java", "python"));
boolean has = set.contains("java"); // true`,
      buildFrames: (state: HashState, params: Record<string, any>): Frame[] => {
        const key = String(params.value);
        const buckets = cloneBuckets(state);
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Ищем "${key}" в множестве.`,
          state: { ...state, buckets },
        });

        const hash = javaStringHash(key);
        const spread = (hash ^ (hash >>> 16)) & 0xffffffff;
        const idx = spread & (state.capacity - 1);
        frames.push({
          step: 2,
          description: `hashCode = ${hash}, бакет = ${idx}.`,
          state: { ...state, buckets },
          highlight: { indices: [idx], color: 'info' },
        });

        const bucket = buckets[idx];
        const found = bucket.entries.some((e) => e.key === key);
        frames.push({
          step: 3,
          description: found
            ? `Элемент "${key}" есть → true.`
            : `Элемента "${key}" нет → false.`,
          state: { ...state, buckets },
          highlight: { indices: [idx], color: found ? 'success' : 'error' },
        });

        return frames;
      },
    },

    // ---------- remove ----------
    {
      slug: 'remove',
      signature: 'boolean remove(Object o)',
      title: 'Удалить элемент',
      description: 'Удаляет элемент из множества. Возвращает true, если он был.',
      complexity: 'O(1) в среднем',
      params: [{ name: 'value', type: 'string', label: 'Значение', default: 'python' }],
      codeSample: `Set<String> set = new HashSet<>(Set.of("java", "python"));
set.remove("python"); // true
set.remove("python"); // false`,
      buildFrames: (state: HashState, params: Record<string, any>): Frame[] => {
        const key = String(params.value);
        const buckets = cloneBuckets(state);
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Удаляем "${key}".`,
          state: { ...state, buckets },
        });

        const hash = javaStringHash(key);
        const spread = (hash ^ (hash >>> 16)) & 0xffffffff;
        const idx = spread & (state.capacity - 1);
        frames.push({
          step: 2,
          description: `hashCode = ${hash}, бакет = ${idx}.`,
          state: { ...state, buckets },
          highlight: { indices: [idx], color: 'info' },
        });

        const bucket = buckets[idx];
        const foundIdx = bucket.entries.findIndex((e) => e.key === key);
        if (foundIdx < 0) {
          frames.push({
            step: 3,
            description: `Элемента "${key}" нет — возвращаем false.`,
            state: { ...state, buckets },
            highlight: { indices: [idx], color: 'error' },
          });
          return frames;
        }

        bucket.entries.splice(foundIdx, 1);
        bucket.collision = bucket.entries.length > 1;
        frames.push({
          step: 3,
          description: `Удалили "${key}" из бакета ${idx}. Возвращаем true.`,
          state: { ...state, buckets },
          highlight: { indices: [idx], color: 'success' },
        });

        return frames;
      },
    },
  ],
};