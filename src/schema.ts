import { co, z } from "jazz-tools"

// Define a simple test item schema
export const TestItem = co.map({
  itemId: z.number(),
  name: z.string(),
  value: z.number(),
  timestamp: z.number(),
  description: z.string(),
})

// Define the main container with a CoList of test items
export const TestContainer = co.map({
  title: z.string(),
  items: co.list(TestItem),
  totalItems: z.number(),
  createdAt: z.number(),
})

// Export loaded types
export type TestItem = co.loaded<typeof TestItem>
export type TestContainer = co.loaded<typeof TestContainer>

// Helper to create test items
export function createTestItem(itemId: number) {
  return {
    itemId,
    name: `Test Item ${itemId}`,
    value: Math.floor(Math.random() * 1000),
    timestamp: Date.now() + itemId,
    description: `This is test item number ${itemId} with random data for stress testing`,
  }
}
