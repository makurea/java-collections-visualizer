import type { CollectionDefinition, Frame, LinkedListState } from '../lib/types';

const defaultState = (): LinkedListState => ({
  kind: 'linked',
  nodes: [
    { id: 'n1', value: '10' },
    { id: 'n2', value: '20' },
    { id: 'n3', value: '30' },
  ],
  headId: 'n1',
  tailId: 'n3',
});

let nextId = 1;
const newId = () => `n${Date.now()}-${nextId++}`;

export const linkedlist: CollectionDefinition = {
  slug: 'linkedlist',
  name: 'LinkedList',
  javaInterface: 'List, Deque',
  shortDescription:
    'Двусвязный список. Быстрые вставки/удаления в начало и конец, но медленный доступ по индексу.',
  icon: '🔗',
  category: 'list',
  priority: 'mvp',
  initialState: defaultState,
  theory: {
  what: `LinkedList — двусвязный список: каждый элемент хранится в отдельном объекте-узле (Node), который знает о предыдущем и следующем соседе. В отличие от массива, элементы LinkedList не лежат в памяти подряд — они разбросаны по куче и связаны ссылками.

LinkedList реализует сразу два интерфейса — List и Deque. Поэтому его можно использовать и как список (с get(i)), и как очередь (addFirst/addLast), и как стек (push/pop). Однако на практике для стека/очереди лучше брать ArrayDeque — он быстрее.`,
  internals: `Внутри LinkedList три поля:
• first (head) — ссылка на первый узел;
• last (tail) — ссылка на последний узел;
• size — количество узлов.

Каждый Node содержит три поля:
• item — само значение;
• next — ссылка на следующий узел (или null);
• prev — ссылка на предыдущий узел (или null).

Операции addFirst/addLast/removeFirst/removeLast работают за O(1) — просто переставляем ссылки на краях списка. А вот get(int index) требует пройтись по узлам от ближнего конца до нужной позиции — это O(n).

Из-за того что узлы разбросаны в куче, итерация по LinkedList медленнее, чем по ArrayList — процессор не может эффективно кэшировать. Парадоксально: даже вставка в середину у LinkedList O(1) (если у вас уже есть Node), но найти этот Node — O(n), поэтому суммарно add(int, E) всё равно O(n).`,
  whenToUse: `LinkedList стоит использовать, когда:
• Реальные операции — addFirst/removeFirst/addLast/removeLast (края);
• Список используется как Deque (очередь, стек);
• Элементы очень большие и вы не хотите их копировать при resize.

Не используйте LinkedList для get(i) в цикле — это O(n²) на весь проход. Классическая ошибка — for (int i = 0; i < list.size(); i++) list.get(i).

На практике в 90% случаев ArrayList или ArrayDeque обгоняют LinkedList даже там, где теоретически LinkedList должен быть быстрее. Причина — кэш процессора и накладные расходы на аллокацию Node-объектов.`,
  complexity: [
    { op: 'addFirst / addLast', bigO: 'O(1)' },
    { op: 'removeFirst / removeLast', bigO: 'O(1)' },
    { op: 'getFirst / getLast', bigO: 'O(1)' },
    { op: 'get(int index)', bigO: 'O(n)' },
    { op: 'add(int, E) / remove(int)', bigO: 'O(n)' },
    { op: 'contains(Object)', bigO: 'O(n)' },
    { op: 'size()', bigO: 'O(1)' },
  ],
  codeSample: `LinkedList<String> list = new LinkedList<>();

list.addFirst("b");      // [b]
list.addLast("c");       // [b, c]
list.addFirst("a");      // [a, b, c]
list.add(1, "x");        // [a, x, b, c]

String first = list.getFirst(); // "a"
String last = list.getLast();   // "c"

list.removeFirst();      // [x, b, c]
list.removeLast();       // [x, b]

// Как Deque:
Deque<Integer> deque = new LinkedList<>();
deque.offerFirst(1);     // [1]
deque.offerLast(2);      // [1, 2]
deque.pollFirst();       // 1 → [2]`,
  pros: [
    'O(1) вставка и удаление с обоих концов',
    'Реализует List и Deque — универсальность',
    'Не требует resize и копирования всего массива',
    'Идеален для сценариев «часто добавляем/удаляем по краям»',
  ],
  cons: [
    'get(i) — O(n), медленный доступ по индексу',
    'Плохая локальность кэша — итерация медленнее, чем у ArrayList',
    'Каждый элемент — отдельный объект Node (дополнительные ~24 байта + ссылки)',
    'На практике почти всегда медленнее ArrayList/ArrayDeque',
  ],
  commonMistakes: [
    'Использовать get(i) в цикле — O(n²) вместо O(n)',
    'Брать LinkedList там, где достаточно ArrayList — теряете производительность',
    'Думать что «LinkedList быстрее для вставок» — только если у вас уже есть Node, а его надо ещё найти',
    'Забывать, что LinkedList не потокобезопасен',
    'Использовать LinkedList как очередь — ArrayDeque быстрее',
  ],
  comparison: [
    { name: 'LinkedList', note: 'Двусвязный список. Хорош для операций с краями и как Deque, плох для get(i).' },
    { name: 'ArrayList', note: 'Динамический массив. Быстрый get, но O(n) на вставку в середину.' },
    { name: 'ArrayDeque', note: 'Кольцевой массив. Лучший выбор для стека/очереди — быстрее LinkedList.' },
    { name: 'ConcurrentLinkedDeque', note: 'Потокобезопасный LinkedList без блокировок (lock-free).' },
  ],
  keyTakeaways: [
    'LinkedList = двусвязный список с head и tail',
    'O(1) для операций с краями, O(n) для операций по индексу',
    'В 90% случаев ArrayList или ArrayDeque лучше',
    'Никогда не делайте get(i) в цикле по LinkedList',
    'Node занимает больше памяти, чем элемент в массиве',
  ],
},
  operations: [
    // ---------- addFirst ----------
    {
      slug: 'add-first',
      signature: 'void addFirst(E e)',
      title: 'Добавить в начало',
      description:
        'Создаёт новый узел, привязывает его перед текущим head. Обновляет ссылку first. O(1).',
      complexity: 'O(1)',
      params: [{ name: 'value', type: 'string', label: 'Значение', default: '5' }],
      codeSample: `LinkedList<Integer> list = new LinkedList<>(List.of(10, 20, 30));
list.addFirst(5); // [5, 10, 20, 30]`,
      buildFrames: (state: LinkedListState, params: Record<string, any>): Frame[] => {
        const value = String(params.value);
        const nodes = [...state.nodes];
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Исходный список: [${nodes.map((n) => n.value).join(', ')}].`,
          state: { ...state, nodes },
        });

        const newId = `new-${nodes.length}-${value}`;
        frames.push({
          step: 2,
          description: `Создаём новый узел Node("${value}").`,
          state: {
            ...state,
            nodes: [...nodes, { id: newId, value }],
            tailId: state.tailId,
          },
          highlight: { nodeIds: [newId], color: 'info' },
          pseudoCode: {
            lines: ['Node<E> f = first;', 'Node<E> newNode = new Node<>(f, e, null);'],
            activeLine: 1,
          },
        });

        frames.push({
          step: 3,
          description: `newNode.next = oldHead (${state.headId}). Теперь новый узел ссылается на старый head.`,
          state: {
            ...state,
            nodes: [{ id: newId, value }, ...nodes],
            headId: newId,
            tailId: state.tailId,
          },
          highlight: { nodeIds: [newId, state.headId!].filter(Boolean), color: 'info' },
        });

        frames.push({
          step: 4,
          description: `first = newNode. Новый узел стал head списка.`,
          state: {
            kind: 'linked',
            nodes: [{ id: newId, value }, ...nodes],
            headId: newId,
            tailId: state.tailId,
          },
          highlight: { nodeIds: [newId], color: 'success' },
          pseudoCode: {
            lines: ['first = newNode;', 'size++;', 'modCount++;'],
            activeLine: 0,
          },
        });

        return frames;
      },
    },

    // ---------- addLast ----------
    {
      slug: 'add-last',
      signature: 'void addLast(E e)',
      title: 'Добавить в конец',
      description: 'Создаёт новый узел, привязывает его после tail. O(1).',
      complexity: 'O(1)',
      params: [{ name: 'value', type: 'string', label: 'Значение', default: '40' }],
      codeSample: `LinkedList<Integer> list = new LinkedList<>(List.of(10, 20, 30));
list.addLast(40); // [10, 20, 30, 40]`,
      buildFrames: (state: LinkedListState, params: Record<string, any>): Frame[] => {
        const value = String(params.value);
        const nodes = [...state.nodes];
        const newId = `new-${nodes.length}-${value}`;
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Исходный список: [${nodes.map((n) => n.value).join(', ')}].`,
          state: { ...state, nodes },
        });

        frames.push({
          step: 2,
          description: `Создаём Node("${value}") с prev = tail.`,
          state: { ...state, nodes: [...nodes, { id: newId, value }] },
          highlight: { nodeIds: [newId], color: 'info' },
        });

        frames.push({
          step: 3,
          description: `oldTail.next = newNode. Связываем хвост с новым узлом.`,
          state: {
            kind: 'linked',
            nodes: [...nodes, { id: newId, value }],
            headId: state.headId,
            tailId: newId,
          },
          highlight: { nodeIds: [state.tailId!, newId], color: 'info' },
        });

        frames.push({
          step: 4,
          description: `last = newNode. Новый узел стал tail. size++.`,
          state: {
            kind: 'linked',
            nodes: [...nodes, { id: newId, value }],
            headId: state.headId,
            tailId: newId,
          },
          highlight: { nodeIds: [newId], color: 'success' },
          pseudoCode: {
            lines: [
              'Node<E> l = last;',
              'Node<E> newNode = new Node<>(l, e, null);',
              'last = newNode;',
              'if (l == null) first = newNode; else l.next = newNode;',
              'size++;',
            ],
            activeLine: 3,
          },
        });

        return frames;
      },
    },

    // ---------- get(int) ----------
    {
      slug: 'get',
      signature: 'E get(int index)',
      title: 'Получить по индексу',
      description:
        'Обходит список от head (или tail, в зависимости от индекса) до нужной позиции. O(n).',
      complexity: 'O(n)',
      params: [{ name: 'index', type: 'number', label: 'Индекс', default: 1, min: 0, max: 10 }],
      codeSample: `LinkedList<Integer> list = new LinkedList<>(List.of(10, 20, 30));
int x = list.get(1); // 20`,
      buildFrames: (state: LinkedListState, params: Record<string, any>): Frame[] => {
        const index = Number(params.index);
        const nodes = state.nodes;
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Запрос get(${index}). Начинаем с head (${state.headId}).`,
          state,
          highlight: { nodeIds: state.headId ? [state.headId] : [], color: 'info' },
        });

        for (let i = 0; i < nodes.length; i++) {
          frames.push({
            step: frames.length + 1,
            description: `i = ${i}, узел = "${nodes[i].value}". ${i === index ? 'Совпадает с индексом!' : 'Идём дальше по next.'}`,
            state,
            highlight: { nodeIds: [nodes[i].id], color: i === index ? 'success' : 'warning' },
            pseudoCode: {
              lines: [
                'Node<E> x = first;',
                'for (int i = 0; i < index; i++)',
                '  x = x.next;',
                'return x.item;',
              ],
              activeLine: 1,
            },
          });
          if (i === index) {
            frames.push({
              step: frames.length + 1,
              description: `Нашли элемент по индексу ${index}: "${nodes[i].value}".`,
              state,
              highlight: { nodeIds: [nodes[i].id], color: 'success' },
            });
            return frames;
          }
        }

        frames.push({
          step: frames.length + 1,
          description: `Индекс ${index} вне диапазона → IndexOutOfBoundsException.`,
          state,
          highlight: { color: 'error' },
        });
        return frames;
      },
    },

    // ---------- removeFirst ----------
    {
      slug: 'remove-first',
      signature: 'E removeFirst()',
      title: 'Удалить первый',
      description:
        'Отвязывает head, делает head = oldHead.next, обнуляет старые ссылки. O(1).',
      complexity: 'O(1)',
      params: [],
      codeSample: `LinkedList<Integer> list = new LinkedList<>(List.of(10, 20, 30));
list.removeFirst(); // [20, 30]`,
      buildFrames: (state: LinkedListState): Frame[] => {
        if (state.nodes.length === 0) {
          return [
            {
              step: 1,
              description: 'Список пуст — удалять нечего.',
              state,
              highlight: { color: 'error' },
            },
          ];
        }
        const nodes = state.nodes;
        const oldHead = nodes[0];
        const newNodes = nodes.slice(1);
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Исходный список: [${nodes.map((n) => n.value).join(', ')}].`,
          state,
        });

        frames.push({
          step: 2,
          description: `Запоминаем oldHead = "${oldHead.value}".`,
          state,
          highlight: { nodeIds: [oldHead.id], color: 'warning' },
        });

        frames.push({
          step: 3,
          description: `first = oldHead.next (${newNodes[0]?.id ?? 'null'}).`,
          state: {
            kind: 'linked',
            nodes,
            headId: newNodes[0]?.id ?? null,
            tailId: state.tailId,
          },
          highlight: { nodeIds: newNodes[0] ? [newNodes[0].id] : [], color: 'info' },
          pseudoCode: {
            lines: [
              'final Node<E> f = first;',
              'first = f.next;',
              'f.next = null;',
              'size--;',
            ],
            activeLine: 1,
          },
        });

        frames.push({
          step: 4,
          description: `oldHead.next = null, size--. Возвращаем "${oldHead.value}".`,
          state: {
            kind: 'linked',
            nodes: newNodes,
            headId: newNodes[0]?.id ?? null,
            tailId: state.tailId === oldHead.id ? newNodes[newNodes.length - 1]?.id ?? null : state.tailId,
          },
          highlight: { color: 'success' },
        });

        return frames;
      },
    },

    // ---------- removeLast ----------
    {
      slug: 'remove-last',
      signature: 'E removeLast()',
      title: 'Удалить последний',
      description:
        'Отвязывает tail, делает tail = oldTail.prev, обнуляет ссылку next. O(1).',
      complexity: 'O(1)',
      params: [],
      codeSample: `LinkedList<Integer> list = new LinkedList<>(List.of(10, 20, 30));
list.removeLast(); // [10, 20]`,
      buildFrames: (state: LinkedListState): Frame[] => {
        if (state.nodes.length === 0) {
          return [
            {
              step: 1,
              description: 'Список пуст — удалять нечего.',
              state,
              highlight: { color: 'error' },
            },
          ];
        }
        const nodes = state.nodes;
        const oldTail = nodes[nodes.length - 1];
        const newNodes = nodes.slice(0, -1);
        const newTailId = newNodes[newNodes.length - 1]?.id ?? null;
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Исходный список: [${nodes.map((n) => n.value).join(', ')}].`,
          state,
        });

        frames.push({
          step: 2,
          description: `Запоминаем oldTail = "${oldTail.value}".`,
          state,
          highlight: { nodeIds: [oldTail.id], color: 'warning' },
        });

        frames.push({
          step: 3,
          description: `last = oldTail.prev (${newTailId ?? 'null'}).`,
          state: {
            kind: 'linked',
            nodes,
            headId: state.headId,
            tailId: newTailId,
          },
          highlight: { nodeIds: newTailId ? [newTailId] : [], color: 'info' },
          pseudoCode: {
            lines: [
              'final Node<E> l = last;',
              'last = l.prev;',
              'l.prev = null;',
              'size--;',
            ],
            activeLine: 1,
          },
        });

        frames.push({
          step: 4,
          description: `oldTail.prev = null, size--. Возвращаем "${oldTail.value}".`,
          state: {
            kind: 'linked',
            nodes: newNodes,
            headId: state.headId,
            tailId: newTailId,
          },
          highlight: { color: 'success' },
        });

        return frames;
      },
    },
  ],
};