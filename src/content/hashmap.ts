import type {
  CollectionDefinition,
  Frame,
  HashState,
  HashBucket,
} from '../lib/types';
import { javaStringHash, spreadHash, bucketIndex } from '../lib/utils';

const CAPACITY = 8;
const TREEIFY_THRESHOLD = 8;

function makeState(entries: { key: string; value?: string }[]): HashState {
  const buckets: HashBucket[] = Array.from({ length: CAPACITY }, (_, i) => ({
    index: i,
    entries: [],
    collision: false,
    treeified: false,
  }));
  for (const e of entries) {
    const h = javaStringHash(e.key);
    const idx = bucketIndex(e.key, CAPACITY);
    buckets[idx].entries.push({ key: e.key, value: e.value, hash: h });
    if (buckets[idx].entries.length > 1) buckets[idx].collision = true;
    if (buckets[idx].entries.length >= TREEIFY_THRESHOLD) buckets[idx].treeified = true;
  }
  return { kind: 'hash', buckets, capacity: CAPACITY };
}

const initialState = () =>
  makeState([
    { key: 'cat', value: 'meow' },
    { key: 'dog', value: 'woof' },
    { key: 'Aa', value: 'first' },
    { key: 'BB', value: 'second' }, // Aa и BB имеют одинаковый hashCode — коллизия!
  ]);

const cloneBuckets = (state: HashState): HashBucket[] =>
  state.buckets.map((b) => ({
    ...b,
    entries: b.entries.map((e) => ({ ...e })),
    collision: b.collision,
    treeified: b.treeified,
  }));

export const hashmap: CollectionDefinition = {
  slug: 'hashmap',
  name: 'HashMap',
  javaInterface: 'Map',
  shortDescription:
    'Хеш-таблица. Быстрый доступ по ключу, при коллизиях — цепочка (или дерево) в бакете.',
  icon: '🗺️',
  category: 'map',
  priority: 'mvp',
  initialState,
  theory: {
  what: `HashMap — самая используемая структура в Java после ArrayList. Это хеш-таблица: массив «бакетов», в каждом из которых может лежать один или несколько элементов. Благодаря хешированию операции put/get/remove в среднем работают за O(1) — константное время, независимо от размера коллекции.

HashMap хранит пары ключ→значение. Ключ должен быть уникальным, значение — любым. Порядок обхода не гарантируется (в отличие от LinkedHashMap).`,
  internals: `Внутри HashMap:
• Node<K,V>[] table — массив бакетов, изначально длина 16;
• size — сколько пар ключ→значение;
• threshold — порог (capacity × loadFactor), после которого происходит resize;
• loadFactor — по умолчанию 0.75.

Каждый Node хранит: hash, key, value, next (ссылка на следующий в цепочке).

При put(key, value):
1. Вычисляется hashCode ключа;
2. Затем spread: (h = key.hashCode()) ^ (h >>> 16) — старшие биты перемешиваются с младшими, чтобы распределение было равномерным;
3. Индекс бакета: (n - 1) & spread, где n = capacity (степень двойки);
4. Если бакет пуст — кладём Node;
5. Если бакет занят — коллизия: проходим по цепочке, сравниваем hash и equals;
6. Если нашли такой же ключ — заменяем значение;
7. Если нет — добавляем в конец цепочки;
8. Если цепочка стала ≥ 8 — treeifyBin превращает её в красно-чёрное дерево;
9. Если size > threshold — resize с удвоением capacity и перераспределением всех элементов.

Именно поэтому важно корректно реализовывать hashCode() и equals() у ключей. Если hashCode даёт плохое распределение (много коллизий) — все элементы соберутся в один бакет, и HashMap деградирует до O(n).`,
  whenToUse: `HashMap — выбор по умолчанию, когда:
• Нужен быстрый доступ по уникальному ключу;
• Порядок не важен;
• Ключи — неизменяемые объекты (String, Integer) или ваши классы с корректными hashCode()/equals().

Не используйте HashMap, если:
• Важен порядок вставки — LinkedHashMap;
• Нужна сортировка по ключу — TreeMap;
• Нужна потокобезопасность — ConcurrentHashMap;
• Ключи — изменяемые объекты (их hashCode поменяется — и вы больше не найдёте свою пару).`,
  complexity: [
    { op: 'put(K, V)', bigO: 'O(1) в среднем, O(log n) при дереве, O(n) worst' },
    { op: 'get(K)', bigO: 'O(1) в среднем' },
    { op: 'remove(K)', bigO: 'O(1) в среднем' },
    { op: 'containsKey(K)', bigO: 'O(1) в среднем' },
    { op: 'containsValue(V)', bigO: 'O(n)' },
    { op: 'size()', bigO: 'O(1)' },
    { op: 'resize', bigO: 'O(n)' },
  ],
  codeSample: `Map<String, Integer> map = new HashMap<>();

map.put("apple", 1);
map.put("banana", 2);
map.put("cherry", 3);

int v = map.get("banana");           // 2
boolean has = map.containsKey("apple"); // true
int size = map.size();               // 3

map.put("apple", 10);                // перезапись: 1 → 10
map.remove("cherry");                // удаление

// Итерация:
for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + " = " + e.getValue());
}

// Если ключа может не быть:
int count = map.getOrDefault("kiwi", 0); // 0
map.merge("apple", 1, Integer::sum);     // apple = 11`,
  pros: [
    'O(1) в среднем для put/get/remove',
    'Не требует сортировки или порядка ключей',
    'Автоматический resize при заполнении',
    'При ≥ 8 элементов в бакете цепочка превращается в дерево — защита от O(n)',
  ],
  cons: [
    'Порядок обхода не определён — не полагайтесь на него',
    'Требует корректных hashCode() и equals() у ключей',
    'Не потокобезопасен — ConcurrentHashMap для многопоточности',
    'Хуже локальность кэша, чем у массива',
    'Накладные расходы по памяти: Node-объект на каждую пару',
  ],
  commonMistakes: [
    'Использовать изменяемый объект как ключ — hashCode меняется, пару не найти',
    'Забыть переопределить equals() при переопределении hashCode()',
    'Переопределить equals(), но не hashCode() — коллизии будут массовыми',
    'Использовать null как ключ в ConcurrentHashMap (там нельзя)',
    'Ожидать предсказуемый порядок обхода — его нет',
    'Считать, что "O(1) всегда" — при плохих hashCode возможен O(n)',
  ],
  comparison: [
    { name: 'HashMap', note: 'Быстрый, без порядка. Стандарт по умолчанию.' },
    { name: 'LinkedHashMap', note: 'HashMap + двусвязный список поверх. Гарантирует порядок вставки или доступа.' },
    { name: 'TreeMap', note: 'Красно-чёрное дерево. Ключи отсортированы, O(log n) на операции.' },
    { name: 'ConcurrentHashMap', note: 'Потокобезопасная версия. Лучше, чем Hashtable. Использует CAS и bucket-locking.' },
    { name: 'Hashtable', note: 'Устаревшая синхронизированная версия. Не используйте — берите ConcurrentHashMap.' },
  ],
  keyTakeaways: [
    'HashMap = массив бакетов + цепочки + (при ≥ 8) деревья',
    'Индекс бакета: (n-1) & (hashCode ^ (hashCode >>> 16))',
    'loadFactor 0.75 — баланс между памятью и коллизиями',
    'Ключи обязаны иметь стабильные hashCode() и equals()',
    'При size > capacity × 0.75 происходит resize (удвоение)',
    'Для потокобезопасности — ConcurrentHashMap, не Hashtable',
  ],
},
  operations: [
    // ============================================================
    // put(K, V)
    // ============================================================
    {
      slug: 'put',
      signature: 'V put(K key, V value)',
      title: 'Добавить / заменить',
      description:
        'Вычисляет hashCode ключа, определяет бакет, ищет совпадение ключа через equals(). Если найден — заменяет значение, иначе добавляет новую пару. При длине цепочки ≥ 8 — treeify.',
      complexity: 'O(1) в среднем',
      params: [
        { name: 'key', type: 'string', label: 'Ключ', default: 'cow' },
        { name: 'value', type: 'string', label: 'Значение', default: 'moo' },
      ],
      codeSample: `Map<String, String> map = new HashMap<>();
map.put("cat", "meow");
map.put("dog", "woof");
map.put("cow", "moo"); // новый ключ`,
      buildFrames: (state: HashState, params: Record<string, any>): Frame[] => {
        const key = String(params.key);
        const value = String(params.value);
        const buckets = cloneBuckets(state);
        const frames: Frame[] = [];

        // ---- Шаг 1: начало
        frames.push({
          step: 1,
          description: `Пытаемся добавить "${key}" → "${value}".`,
          state: { ...state, buckets },
          highlight: { hashFormula: { key } },
          pseudoCode: {
            lines: [
              'V put(K key, V value) {',
              '  int hash = hash(key);',
              '  int i = (n-1) & hash;',
              '  ...',
              '}',
            ],
            activeLine: 0,
          },
        });

        // ---- Шаг 2: hashCode
        const hash = javaStringHash(key);
        frames.push({
          step: 2,
          description: `Вычисляем hashCode("${key}") = ${hash}.`,
          state: { ...state, buckets },
          highlight: { hashFormula: { key, hashCode: hash } },
          pseudoCode: {
            lines: [
              'V put(K key, V value) {',
              '  int hash = hash(key);',
              '  int i = (n-1) & hash;',
              '  ...',
              '}',
            ],
            activeLine: 1,
          },
        });

        // ---- Шаг 3: spread
        const spread = spreadHash(hash);
        const idx = spread & (state.capacity - 1);
        frames.push({
          step: 3,
          description: `Spread: ${hash} ^ (${hash} >>> 16) = ${spread}. Старшие биты перемешаны в младшие.`,
          state: { ...state, buckets },
          highlight: {
            hashFormula: { key, hashCode: hash, spread },
            indices: [idx],
            color: 'info',
          },
          pseudoCode: {
            lines: [
              'static int hash(Object key) {',
              '  int h;',
              '  return (key == null) ? 0',
              '    : (h = key.hashCode()) ^ (h >>> 16);',
              '}',
            ],
            activeLine: 2,
          },
        });

        // ---- Шаг 4: index
        frames.push({
          step: 4,
          description: `Индекс бакета: ${spread} & ${state.capacity - 1} = ${idx}. Идём в бакет [${idx}].`,
          state: { ...state, buckets },
          highlight: {
            hashFormula: {
              key,
              hashCode: hash,
              spread,
              index: idx,
              capacity: state.capacity,
            },
            indices: [idx],
            color: 'info',
          },
          pseudoCode: {
            lines: [
              'int i = (n - 1) & hash;',
              'Node<K,V> p = tab[i];',
            ],
            activeLine: 0,
          },
        });

        const bucket = buckets[idx];

        // ---- Ветка A: бакет пуст
        if (bucket.entries.length === 0) {
          bucket.entries.push({ key, value, hash });
          frames.push({
            step: frames.length + 1,
            description: `Бакет [${idx}] пуст. Создаём узел и вставляем "${key}" → "${value}".`,
            state: { ...state, buckets },
            highlight: {
              hashFormula: {
                key,
                hashCode: hash,
                spread,
                index: idx,
                capacity: state.capacity,
              },
              indices: [idx],
              color: 'success',
            },
            pseudoCode: {
              lines: [
                'if (p == null)',
                '  tab[i] = newNode(hash, key, value, null);',
                '++modCount;',
                '++size;',
              ],
              activeLine: 1,
            },
          });
          return frames;
        }

        // ---- Ветка B: коллизия
        frames.push({
          step: frames.length + 1,
          description: `Бакет [${idx}] не пуст — коллизия (${bucket.entries.length} элемент(ов)). Проверяем цепочку.`,
          state: { ...state, buckets },
          highlight: {
            hashFormula: {
              key,
              hashCode: hash,
              spread,
              index: idx,
              capacity: state.capacity,
            },
            indices: [idx],
            color: 'warning',
          },
          pseudoCode: {
            lines: [
              'else {',
              '  do {',
              '    if (e.hash == hash && e.key.equals(key))',
              '      break;',
              '  } while ((e = e.next) != null);',
              '}',
            ],
            activeLine: 2,
          },
        });

        const existingIdx = bucket.entries.findIndex((e) => e.key === key);

        if (existingIdx >= 0) {
          // ---- Ветка B1: ключ уже есть — замена
          const oldVal = bucket.entries[existingIdx].value;
          bucket.entries[existingIdx].value = value;
          frames.push({
            step: frames.length + 1,
            description: `Ключ "${key}" уже есть (было "${oldVal}"). Заменяем значение на "${value}".`,
            state: { ...state, buckets },
            highlight: {
              hashFormula: {
                key,
                hashCode: hash,
                spread,
                index: idx,
                capacity: state.capacity,
              },
              indices: [idx],
              color: 'success',
            },
            pseudoCode: {
              lines: [
                'if (e != null) {',
                '  V oldValue = e.value;',
                '  e.value = value;',
                '  return oldValue;',
                '}',
              ],
              activeLine: 2,
            },
          });
        } else {
          // ---- Ветка B2: новый ключ в цепочку
          bucket.entries.push({ key, value, hash });
          bucket.collision = bucket.entries.length > 1;
          frames.push({
            step: frames.length + 1,
            description: `Ключ "${key}" не найден в цепочке. Добавляем новый узел в конец бакета [${idx}]. Теперь ${bucket.entries.length} элементов.`,
            state: { ...state, buckets },
            highlight: {
              hashFormula: {
                key,
                hashCode: hash,
                spread,
                index: idx,
                capacity: state.capacity,
              },
              indices: [idx],
              color: 'success',
            },
            pseudoCode: {
              lines: [
                'if (e == null) {',
                '  p.next = newNode(hash, key, value, null);',
                '  if (binCount >= TREEIFY_THRESHOLD - 1)',
                '    treeifyBin(tab, hash);',
                '}',
              ],
              activeLine: 1,
            },
          });

          // ---- Проверка treeify
          if (bucket.entries.length >= TREEIFY_THRESHOLD && !bucket.treeified) {
            bucket.treeified = true;
            frames.push({
              step: frames.length + 1,
              description: `⚠️ В бакете [${idx}] стало ≥ ${TREEIFY_THRESHOLD} элементов. Java превращает цепочку в красно-чёрное дерево (treeifyBin). Поиск теперь O(log k) вместо O(k).`,
              state: { ...state, buckets },
              highlight: {
                hashFormula: {
                  key,
                  hashCode: hash,
                  spread,
                  index: idx,
                  capacity: state.capacity,
                },
                indices: [idx],
                color: 'warning',
              },
              pseudoCode: {
                lines: [
                  'final void treeifyBin(Node<K,V>[] tab, int hash) {',
                  '  // заменяем Node-цепочку на TreeNode',
                  '  // теперь поиск O(log k)',
                  '}',
                ],
                activeLine: 1,
              },
            });
          }
        }

        return frames;
      },
    },

    // ============================================================
    // get(K)
    // ============================================================
    {
      slug: 'get',
      signature: 'V get(Object key)',
      title: 'Получить значение',
      description:
        'Вычисляет hashCode ключа, находит бакет, перебирает цепочку (или дерево) и сравнивает ключи через equals().',
      complexity: 'O(1) в среднем',
      params: [{ name: 'key', type: 'string', label: 'Ключ', default: 'cat' }],
      codeSample: `Map<String, String> map = new HashMap<>();
map.put("cat", "meow");
String v = map.get("cat"); // "meow"`,
      buildFrames: (state: HashState, params: Record<string, any>): Frame[] => {
        const key = String(params.key);
        const buckets = cloneBuckets(state);
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Ищем значение по ключу "${key}".`,
          state: { ...state, buckets },
          highlight: { hashFormula: { key } },
          pseudoCode: {
            lines: [
              'V get(Object key) {',
              '  Node<K,V> e;',
              '  return (e = getNode(key)) == null ? null : e.value;',
              '}',
              'Node<K,V> getNode(Object key) {',
              '  int hash = hash(key);',
              '  Node<K,V> first = tab[(n-1) & hash];',
              '  if (first != null) {',
              '    // обход цепочки / дерева',
              '  }',
              '  return null;',
              '}',
            ],
            activeLine: 0,
          },
        });

        const hash = javaStringHash(key);
        frames.push({
          step: 2,
          description: `hashCode("${key}") = ${hash}.`,
          state: { ...state, buckets },
          highlight: { hashFormula: { key, hashCode: hash } },
          pseudoCode: {
            lines: [
              'V get(Object key) {',
              '  Node<K,V> e;',
              '  return (e = getNode(key)) == null ? null : e.value;',
              '}',
              'Node<K,V> getNode(Object key) {',
              '  int hash = hash(key);',
              '  Node<K,V> first = tab[(n-1) & hash];',
              '  if (first != null) {',
              '    // обход цепочки / дерева',
              '  }',
              '  return null;',
              '}',
            ],
            activeLine: 5,
          },
        });

        const spread = spreadHash(hash);
        const idx = spread & (state.capacity - 1);
        frames.push({
          step: 3,
          description: `Spread = ${spread}. Индекс бакета: ${spread} & ${state.capacity - 1} = ${idx}.`,
          state: { ...state, buckets },
          highlight: {
            hashFormula: { key, hashCode: hash, spread, index: idx, capacity: state.capacity },
            indices: [idx],
            color: 'info',
          },
          pseudoCode: {
            lines: [
              'V get(Object key) {',
              '  Node<K,V> e;',
              '  return (e = getNode(key)) == null ? null : e.value;',
              '}',
              'Node<K,V> getNode(Object key) {',
              '  int hash = hash(key);',
              '  Node<K,V> first = tab[(n-1) & hash];',
              '  if (first != null) {',
              '    // обход цепочки / дерева',
              '  }',
              '  return null;',
              '}',
            ],
            activeLine: 6,
          },
        });

        const bucket = buckets[idx];

        if (bucket.entries.length === 0) {
          frames.push({
            step: frames.length + 1,
            description: `Бакет [${idx}] пуст — возвращаем null.`,
            state: { ...state, buckets },
            highlight: {
              hashFormula: { key, hashCode: hash, spread, index: idx, capacity: state.capacity },
              indices: [idx],
              color: 'error',
            },
          });
          return frames;
        }

        let found = false;
        for (let i = 0; i < bucket.entries.length; i++) {
          const e = bucket.entries[i];
          const match = e.key === key;
          frames.push({
            step: frames.length + 1,
            description: `Сравниваем "${e.key}" с "${key}": ${match ? 'совпадение!' : 'не совпадает, идём дальше по next'}.`,
            state: { ...state, buckets },
            highlight: {
              hashFormula: { key, hashCode: hash, spread, index: idx, capacity: state.capacity },
              indices: [idx],
              color: match ? 'success' : 'warning',
            },
            pseudoCode: {
              lines: [
                'do {',
                '  if (e.hash == hash && e.key.equals(key))',
                '    return e;',
                '} while ((e = e.next) != null);',
              ],
              activeLine: 1,
            },
          });
          if (match) {
            frames.push({
              step: frames.length + 1,
              description: `Найдено значение "${e.value}". Возвращаем его.`,
              state: { ...state, buckets },
              highlight: {
                hashFormula: { key, hashCode: hash, spread, index: idx, capacity: state.capacity },
                indices: [idx],
                color: 'success',
              },
            });
            found = true;
            break;
          }
        }

        if (!found) {
          frames.push({
            step: frames.length + 1,
            description: `Ключ "${key}" не найден в бакете [${idx}] — возвращаем null.`,
            state: { ...state, buckets },
            highlight: {
              hashFormula: { key, hashCode: hash, spread, index: idx, capacity: state.capacity },
              indices: [idx],
              color: 'error',
            },
          });
        }

        return frames;
      },
    },

    // ============================================================
    // remove(K)
    // ============================================================
    {
      slug: 'remove',
      signature: 'V remove(Object key)',
      title: 'Удалить по ключу',
      description:
        'Находит бакет, удаляет узел из цепочки (перестраивает ссылки next). Если бакет был treeified — возвращается в цепочку при малом размере.',
      complexity: 'O(1) в среднем',
      params: [{ name: 'key', type: 'string', label: 'Ключ', default: 'dog' }],
      codeSample: `Map<String, String> map = new HashMap<>();
map.put("cat", "meow");
map.remove("cat"); // вернёт "meow"`,
      buildFrames: (state: HashState, params: Record<string, any>): Frame[] => {
        const key = String(params.key);
        const buckets = cloneBuckets(state);
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Удаляем ключ "${key}".`,
          state: { ...state, buckets },
          highlight: { hashFormula: { key } },
          pseudoCode: {
            lines: [
              'V remove(Object key) {',
              '  Node<K,V> e;',
              '  return (e = removeNode(hash(key), key, null, false, true))',
              '    == null ? null : e.value;',
              '}',
            ],
            activeLine: 0,
          },
        });

        const hash = javaStringHash(key);
        frames.push({
          step: 2,
          description: `hashCode("${key}") = ${hash}.`,
          state: { ...state, buckets },
          highlight: { hashFormula: { key, hashCode: hash } },
        });

        const spread = spreadHash(hash);
        const idx = spread & (state.capacity - 1);
        frames.push({
          step: 3,
          description: `Индекс бакета: ${spread} & ${state.capacity - 1} = ${idx}.`,
          state: { ...state, buckets },
          highlight: {
            hashFormula: { key, hashCode: hash, spread, index: idx, capacity: state.capacity },
            indices: [idx],
            color: 'info',
          },
        });

        const bucket = buckets[idx];
        const foundIdx = bucket.entries.findIndex((e) => e.key === key);

        if (foundIdx < 0) {
          frames.push({
            step: frames.length + 1,
            description: `Ключ "${key}" не найден в бакете [${idx}] — возвращаем null.`,
            state: { ...state, buckets },
            highlight: {
              hashFormula: { key, hashCode: hash, spread, index: idx, capacity: state.capacity },
              indices: [idx],
              color: 'error',
            },
          });
          return frames;
        }

        const removed = bucket.entries[foundIdx];
        frames.push({
          step: frames.length + 1,
          description: `Нашли узел "${removed.key}" → "${removed.value}". Готовимся к удалению из цепочки.`,
          state: { ...state, buckets },
          highlight: {
            hashFormula: { key, hashCode: hash, spread, index: idx, capacity: state.capacity },
            indices: [idx],
            color: 'warning',
          },
          pseudoCode: {
            lines: [
              'if (node == p)',
              '  tab[i] = node.next;',
              'else',
              '  p.next = node.next;',
              'node.next = null;',
              '--size;',
            ],
            activeLine: 1,
          },
        });

        bucket.entries.splice(foundIdx, 1);
        bucket.collision = bucket.entries.length > 1;
        if (bucket.entries.length < TREEIFY_THRESHOLD) {
          bucket.treeified = false;
        }

        frames.push({
          step: frames.length + 1,
          description: `Узел удалён. В бакете [${idx}] осталось ${bucket.entries.length} элемент(ов). Возвращаем "${removed.value}".`,
          state: { ...state, buckets },
          highlight: {
            hashFormula: { key, hashCode: hash, spread, index: idx, capacity: state.capacity },
            indices: [idx],
            color: 'success',
          },
          pseudoCode: {
            lines: [
              'if (node == p)',
              '  tab[i] = node.next;',
              'else',
              '  p.next = node.next;',
              'node.next = null;',
              '--size;',
            ],
            activeLine: 4,
          },
        });

        return frames;
      },
    },

    // ============================================================
    // containsKey(K)
    // ============================================================
    {
      slug: 'contains-key',
      signature: 'boolean containsKey(Object key)',
      title: 'Есть ли такой ключ?',
      description: 'То же, что get, но возвращает true/false.',
      complexity: 'O(1) в среднем',
      params: [{ name: 'key', type: 'string', label: 'Ключ', default: 'cat' }],
      codeSample: `Map<String, String> map = new HashMap<>();
map.put("cat", "meow");
boolean has = map.containsKey("cat"); // true`,
      buildFrames: (state: HashState, params: Record<string, any>): Frame[] => {
        const key = String(params.key);
        const buckets = cloneBuckets(state);
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Проверяем наличие ключа "${key}".`,
          state: { ...state, buckets },
          highlight: { hashFormula: { key } },
        });

        const hash = javaStringHash(key);
        frames.push({
          step: 2,
          description: `hashCode("${key}") = ${hash}.`,
          state: { ...state, buckets },
          highlight: { hashFormula: { key, hashCode: hash } },
        });

        const spread = spreadHash(hash);
        const idx = spread & (state.capacity - 1);
        frames.push({
          step: 3,
          description: `Spread = ${spread}, бакет [${idx}].`,
          state: { ...state, buckets },
          highlight: {
            hashFormula: { key, hashCode: hash, spread, index: idx, capacity: state.capacity },
            indices: [idx],
            color: 'info',
          },
        });

        const bucket = buckets[idx];
        const found = bucket.entries.some((e) => e.key === key);
        frames.push({
          step: 4,
          description: found
            ? `Ключ "${key}" найден → containsKey возвращает true.`
            : `Ключ "${key}" не найден → containsKey возвращает false.`,
          state: { ...state, buckets },
          highlight: {
            hashFormula: { key, hashCode: hash, spread, index: idx, capacity: state.capacity },
            indices: [idx],
            color: found ? 'success' : 'error',
          },
        });

        return frames;
      },
    },
  ],
};