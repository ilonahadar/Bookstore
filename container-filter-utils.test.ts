import { Container, Navigation, PayerSpace } from '@/types/thanos-types'
import { filterContainerChildrenToActive } from './container-filter-utils'

const createItem = (inactiveDate: string | null): Navigation | PayerSpace => ({
  configurationId: `navigation-configuratrion-id`,
  id: `navigation-id`,
  type: 'NAVIGATION',
  inactiveDate,
})

const createContainer = (
  inactiveDate: string | null,
  children: (Container | Navigation | PayerSpace)[]
): Container => ({
  configurationId: `container-configuratrion-id`,
  id: `container-id`,
  type: 'CONTAINER',
  inactiveDate,
  children,
})

const pastDate = '2020-01-01T05:00:00.000Z'
const futureDate = '2099-01-01T05:00:00.000Z'

const onlyUnexpiredItems = [createItem(futureDate), createItem(null)]

const itemsWithSomeThatAreExpired = [
  createItem(pastDate),
  ...onlyUnexpiredItems,
]

describe('filterContainerChildrenToActive', () => {
  it('returns unmodified container if all items and containers are active', () => {
    const inputContainerWithNoExpiredItems = createContainer(null, [
      ...onlyUnexpiredItems,
      createContainer(null, [
        ...onlyUnexpiredItems,
        createContainer(null, [...onlyUnexpiredItems]),
      ]),
    ])

    const filteredContainer = filterContainerChildrenToActive(
      inputContainerWithNoExpiredItems
    )

    expect(filteredContainer).toEqual(inputContainerWithNoExpiredItems)
  })

  it('removes any containers with `inactiveDate` in the past', () => {
    const inputContainer = createContainer(null, [
      createContainer(pastDate, itemsWithSomeThatAreExpired),
    ])
    const containerWithExpiredItemsRemoved = createContainer(null, [])

    const filteredContainer = filterContainerChildrenToActive(inputContainer)

    expect(filteredContainer).toEqual(containerWithExpiredItemsRemoved)
  })

  it('removes deeply nested inactive children', () => {
    const containerWithDeeplyNestedInactiveItems = createContainer(null, [
      ...itemsWithSomeThatAreExpired,
      createContainer(null, [
        ...itemsWithSomeThatAreExpired,
        createContainer(null, [
          ...onlyUnexpiredItems,
          createContainer(null, [
            ...itemsWithSomeThatAreExpired,
            createContainer(null, [
              ...itemsWithSomeThatAreExpired,
              createContainer(null, itemsWithSomeThatAreExpired),
            ]),
          ]),
        ]),
      ]),
    ])

    const containerWithDeeplyNextedExpiredItemsRemoved = createContainer(null, [
      ...onlyUnexpiredItems,
      createContainer(null, [
        ...onlyUnexpiredItems,
        createContainer(null, [
          ...onlyUnexpiredItems,
          createContainer(null, [
            ...onlyUnexpiredItems,
            createContainer(null, [
              ...onlyUnexpiredItems,
              createContainer(null, onlyUnexpiredItems),
            ]),
          ]),
        ]),
      ]),
    ])

    const filteredContainer = filterContainerChildrenToActive(
      containerWithDeeplyNestedInactiveItems
    )

    expect(filteredContainer).toEqual(
      containerWithDeeplyNextedExpiredItemsRemoved
    )
  })
})