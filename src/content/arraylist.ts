import type { CollectionDefinition, Frame, ArrayState } from '../lib/types';

const defaultState = (): ArrayState => ({
  kind: 'array',
  elements: [10, 20, 30],
  capacity: 8,
  indices: true,
});

export const arraylist: CollectionDefinition = {
  slug: 'arraylist',
  name: 'ArrayList',
  javaInterface: 'List',
  shortDescription:
    'Динамический массив. Быстрый доступ по индексу, но вставка/удаление в середину — дорого.',
  icon: '📋',
  category: 'list',
  priority: 'mvp',
  initialState: defaultState,
  theory: {
    what: `ArrayList — это реализация интерфейса List на основе обычного массива. При добавлении элементов массив автоматически увеличивается («resize»).`,
    internals: `Внутри ArrayList хранит поле elementData (Object[]) — обычный массив и переменную size. При вызове add(), если size == elementData.length, создаётся новый массив в 1.5 раза больше, элементы копируются (Arrays.copyOf). Начальная ёмкость в реальном Java — 10, но в визуализаторе для наглядности используются меньшие значения.`,
    whenToUse: `Используйте ArrayList, когда нужно часто читать элементы по индексу (get/set) и добавлять в конец. Если операций вставки/удаления в середину много — лучше LinkedList или другая структура.`,
    complexity: [
      { op: 'get(int)', bigO: 'O(1)' },
      { op: 'set(int, E)', bigO: 'O(1)' },
      { op: 'add(E)', bigO: 'O(1) амортизированно' },
      { op: 'add(int, E)', bigO: 'O(n)' },
      { op: 'remove(int)', bigO: 'O(n)' },
      { op: 'contains(Object)', bigO: 'O(n)' },
    ],
    codeSample: `List<String> list = new ArrayList<>();
list.add("a");           // [a]
list.add("b");           // [a, b]
list.add(0, "x");        // [x, a, b]
String s = list.get(1);  // "a"
list.remove(0);          // [a, b]`,
  },
  operations: [
    // ---------- add(E) ----------
    {
      slug: 'add',
      signature: 'boolean add(E e)',
      title: 'Добавить в конец',
      description:
        'Добавляет элемент в конец списка. Если массив заполнен — создаётся новый массив в 1.5 раза больше. (Для демонстрации resize используется ёмкость 4, а не 10 как в реальном Java.)',
      complexity: 'O(1) амортизированно',
      params: [{ name: 'value', type: 'string', label: 'Значение', default: '50' }],
      codeSample: `List<Integer> list = new ArrayList<>();
list.add(10);
list.add(20);
list.add(30);
list.add(40);
list.add(50); // добавление в конец`,
      initialState: (): ArrayState => ({
        kind: 'array',
        elements: [10, 20, 30, 40],
        capacity: 4,
        indices: true,
      }),
      buildFrames: (state: ArrayState, params: Record<string, any>): Frame[] => {
        const value = String(params.value);
        const elements = [...state.elements];
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Исходное состояние: ${elements.length} элементов, ёмкость ${state.capacity}.`,
          state: { ...state, elements: [...elements] },
          pseudoCode: {
            lines: [
              'public boolean add(E e) {',
              '  modCount++;',
              '  if (size == elementData.length) grow();',
              '  elementData[size++] = e;',
              '  return true;',
              '}',
            ],
            activeLine: 2,
          },
        });

        let capacity = state.capacity;
        if (elements.length >= capacity) {
          const newCap = Math.max(capacity + 1, Math.floor(capacity * 1.5));
          capacity = newCap;
          frames.push({
            step: frames.length + 1,
            description: `Массив заполнен (size = capacity = ${elements.length}). Создаём новый массив ёмкостью ${newCap} и копируем элементы.`,
            state: { ...state, elements: [...elements], capacity },
            highlight: { color: 'warning' },
            pseudoCode: {
              lines: [
                'private void grow() {',
                '  int newCap = oldCap + (oldCap >> 1);',
                '  elementData = Arrays.copyOf(elementData, newCap);',
                '}',
              ],
              activeLine: 1,
            },
          });
        }

        const newElements = [...elements, value];
        frames.push({
          step: frames.length + 1,
          description: `Помещаем "${value}" в позицию ${elements.length}. size = ${newElements.length}.`,
          state: { ...state, elements: newElements, capacity },
          highlight: { indices: [elements.length], color: 'success' },
          pseudoCode: {
            lines: [
              'public boolean add(E e) {',
              '  if (size == elementData.length) grow();',
              '  elementData[size++] = e;',
              '  return true;',
              '}',
            ],
            activeLine: 2,
          },
        });

        return frames;
      },
    },

    // ---------- add(int, E) ----------
    {
      slug: 'add-at',
      signature: 'void add(int index, E e)',
      title: 'Вставка по индексу',
      description:
        'Вставляет элемент по указанному индексу, сдвигая все элементы правее на одну позицию. Сложность O(n).',
      complexity: 'O(n)',
      params: [
        { name: 'index', type: 'number', label: 'Индекс', default: 1, min: 0, max: 10 },
        { name: 'value', type: 'string', label: 'Значение', default: '99' },
      ],
      codeSample: `List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
list.add(1, 99); // [10, 99, 20, 30]`,
      buildFrames: (state: ArrayState, params: Record<string, any>): Frame[] => {
        const index = Math.max(0, Math.min(Number(params.index), state.elements.length));
        const value = String(params.value);
        const elements = [...state.elements];
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Исходный список: [${elements.join(', ')}]. Вставляем "${value}" по индексу ${index}.`,
          state: { ...state, elements: [...elements] },
        });

        // resize if needed
        let capacity = state.capacity;
        if (elements.length >= capacity) {
          capacity = Math.max(capacity + 1, Math.floor(capacity * 1.5));
          frames.push({
            step: frames.length + 1,
            description: `Массив заполнен. Увеличиваем ёмкость до ${capacity}.`,
            state: { ...state, elements: [...elements], capacity },
            highlight: { color: 'warning' },
          });
        }

        // сдвиг вправо
        const shifted = [...elements, null as any];
        for (let i = elements.length; i > index; i--) {
          shifted[i] = shifted[i - 1];
          const snapshot = [...shifted];
          frames.push({
            step: frames.length + 1,
            description: `Сдвигаем элемент с индекса ${i - 1} на ${i}: "${elements[i - 1]}".`,
            state: { ...state, elements: snapshot, capacity },
            highlight: { indices: [i, i - 1], color: 'warning' },
            pseudoCode: {
              lines: [
                'System.arraycopy(',
                '  elementData, index,',
                '  elementData, index + 1,',
                '  size - index);',
              ],
              activeLine: 0,
            },
          });
        }

        shifted[index] = value;
        frames.push({
          step: frames.length + 1,
          description: `Ставим "${value}" на освободившееся место (индекс ${index}).`,
          state: { ...state, elements: [...shifted], capacity },
          highlight: { indices: [index], color: 'success' },
          pseudoCode: {
            lines: ['elementData[index] = e;', 'size++;'],
            activeLine: 0,
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
      description: 'Прямое обращение к элементу массива по индексу за O(1).',
      complexity: 'O(1)',
      params: [{ name: 'index', type: 'number', label: 'Индекс', default: 1, min: 0, max: 10 }],
      codeSample: `List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
int x = list.get(1); // 20`,
      buildFrames: (state: ArrayState, params: Record<string, any>): Frame[] => {
        const index = Number(params.index);
        const elements = state.elements;
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Запрос get(${index}). Проверяем границы: 0 <= ${index} < ${elements.length}.`,
          state,
          highlight: { color: 'info' },
          pseudoCode: {
            lines: [
              'public E get(int index) {',
              '  Objects.checkIndex(index, size);',
              '  return elementData(index);',
              '}',
            ],
            activeLine: 1,
          },
        });

        if (index < 0 || index >= elements.length) {
          frames.push({
            step: 2,
            description: `Индекс ${index} вне диапазона → IndexOutOfBoundsException.`,
            state,
            highlight: { color: 'error' },
          });
          return frames;
        }

        frames.push({
          step: 2,
          description: `Возвращаем элемент elementData[${index}] = "${elements[index]}".`,
          state,
          highlight: { indices: [index], color: 'success' },
          pseudoCode: {
            lines: [
              'public E get(int index) {',
              '  Objects.checkIndex(index, size);',
              '  return elementData(index);',
              '}',
            ],
            activeLine: 2,
          },
        });

        return frames;
      },
    },

    // ---------- set(int, E) ----------
    {
      slug: 'set',
      signature: 'E set(int index, E e)',
      title: 'Заменить по индексу',
      description: 'Заменяет элемент по индексу. Возвращает старое значение. O(1).',
      complexity: 'O(1)',
      params: [
        { name: 'index', type: 'number', label: 'Индекс', default: 1, min: 0, max: 10 },
        { name: 'value', type: 'string', label: 'Новое значение', default: '77' },
      ],
      codeSample: `List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
Integer old = list.set(1, 77); // old = 20, список = [10, 77, 30]`,
      buildFrames: (state: ArrayState, params: Record<string, any>): Frame[] => {
        const index = Number(params.index);
        const value = String(params.value);
        const elements = state.elements;
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Исходный список: [${elements.join(', ')}].`,
          state,
        });

        if (index < 0 || index >= elements.length) {
          frames.push({
            step: 2,
            description: `Индекс ${index} вне диапазона → IndexOutOfBoundsException.`,
            state,
            highlight: { color: 'error' },
          });
          return frames;
        }

        const updated = [...elements];
        const old = updated[index];
        updated[index] = value;
        frames.push({
          step: 2,
          description: `Заменяем elementData[${index}] = "${old}" на "${value}".`,
          state: { ...state, elements: updated },
          highlight: { indices: [index], color: 'success' },
          pseudoCode: {
            lines: [
              'public E set(int index, E e) {',
              '  E old = elementData(index);',
              '  elementData[index] = e;',
              '  return old;',
              '}',
            ],
            activeLine: 2,
          },
        });

        return frames;
      },
    },

    // ---------- remove(int) ----------
    {
      slug: 'remove',
      signature: 'E remove(int index)',
      title: 'Удалить по индексу',
      description:
        'Удаляет элемент по индексу и сдвигает все элементы правее на одну позицию влево. O(n).',
      complexity: 'O(n)',
      params: [{ name: 'index', type: 'number', label: 'Индекс', default: 1, min: 0, max: 10 }],
      codeSample: `List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
list.remove(1); // [10, 30]`,
      buildFrames: (state: ArrayState, params: Record<string, any>): Frame[] => {
        const index = Number(params.index);
        const elements = [...state.elements];
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Исходный список: [${elements.join(', ')}]. Удаляем элемент по индексу ${index}.`,
          state,
        });

        if (index < 0 || index >= elements.length) {
          frames.push({
            step: 2,
            description: `Индекс ${index} вне диапазона → IndexOutOfBoundsException.`,
            state,
            highlight: { color: 'error' },
          });
          return frames;
        }

        const removed = elements[index];
        frames.push({
          step: 2,
          description: `Запоминаем удаляемый элемент elementData[${index}] = "${removed}".`,
          state,
          highlight: { indices: [index], color: 'warning' },
          pseudoCode: {
            lines: [
              'public E remove(int index) {',
              '  E old = elementData(index);',
              '  fastRemove(index);',
              '  return old;',
              '}',
            ],
            activeLine: 1,
          },
        });

        // сдвиг влево
        const shifted = [...elements];
        for (let i = index; i < elements.length - 1; i++) {
          shifted[i] = shifted[i + 1];
          const snapshot = shifted.slice(0, elements.length - 1);
          frames.push({
            step: frames.length + 1,
            description: `Сдвигаем элемент с индекса ${i + 1} на ${i}: "${elements[i + 1]}".`,
            state: { ...state, elements: [...snapshot, null] },
            highlight: { indices: [i, i + 1], color: 'warning' },
            pseudoCode: {
              lines: [
                'System.arraycopy(',
                '  elementData, index + 1,',
                '  elementData, index,',
                '  size - index - 1);',
              ],
              activeLine: 0,
            },
          });
        }

        const finalElements = elements.filter((_, i) => i !== index);
        frames.push({
          step: frames.length + 1,
          description: `Размер уменьшен до ${finalElements.length}. Удалённый элемент: "${removed}".`,
          state: { ...state, elements: finalElements },
          highlight: { color: 'success' },
        });

        return frames;
      },
    },

    // ---------- contains ----------
    {
      slug: 'contains',
      signature: 'boolean contains(Object o)',
      title: 'Содержит элемент?',
      description:
        'Линейный поиск по массиву: сравниваем каждый элемент с искомым через equals(). O(n).',
      complexity: 'O(n)',
      params: [{ name: 'value', type: 'string', label: 'Значение', default: '20' }],
      codeSample: `List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
boolean has = list.contains(20); // true`,
      buildFrames: (state: ArrayState, params: Record<string, any>): Frame[] => {
        const target = String(params.value);
        const elements = state.elements;
        const frames: Frame[] = [];

        frames.push({
          step: 1,
          description: `Ищем "${target}" в списке [${elements.join(', ')}].`,
          state,
        });

        for (let i = 0; i < elements.length; i++) {
          const match = String(elements[i]) === target;
          frames.push({
            step: frames.length + 1,
            description: `Сравниваем элемент [${i}] = "${elements[i]}" с "${target}": ${match ? 'совпадение!' : 'не равно'}.`,
            state,
            highlight: { indices: [i], color: match ? 'success' : 'warning' },
            pseudoCode: {
              lines: [
                'for (int i = 0; i < size; i++)',
                '  if (o.equals(elementData[i])) return true;',
                'return false;',
              ],
              activeLine: 1,
            },
          });
          if (match) {
            frames.push({
              step: frames.length + 1,
              description: `Элемент найден по индексу ${i}. Возвращаем true.`,
              state,
              highlight: { indices: [i], color: 'success' },
            });
            return frames;
          }
        }

        frames.push({
          step: frames.length + 1,
          description: `Элемент не найден. Возвращаем false.`,
          state,
          highlight: { color: 'error' },
        });
        return frames;
      },
    },

    // ---------- size ----------
    {
      slug: 'size',
      signature: 'int size()',
      title: 'Размер списка',
      description: 'Возвращает значение поля size. O(1).',
      complexity: 'O(1)',
      params: [],
      codeSample: `List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
int n = list.size(); // 3`,
      buildFrames: (state: ArrayState): Frame[] => {
        return [
          {
            step: 1,
            description: `Поле size = ${state.elements.length}. Возвращаем ${state.elements.length}.`,
            state,
            highlight: { indices: state.elements.map((_, i) => i), color: 'info' },
            pseudoCode: {
              lines: ['public int size() {', '  return size;', '}'],
              activeLine: 1,
            },
          },
        ];
      },
    },
  ],
};