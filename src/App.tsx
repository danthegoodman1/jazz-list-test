import { useAccount, useCoState } from "jazz-tools/react"
import "./App.css"
import { co, Group } from "jazz-tools"
import { TestContainer, TestItem, createTestItem } from "./schema"
import { useEffect, useState } from "react"

export default function App() {
  const { me } = useAccount()

  if (!me) return

  // Get the id from query parameters
  const urlParams = new URLSearchParams(window.location.search)
  const containerId = urlParams.get("id")

  // Get container and items early
  const container = useCoState(TestContainer, containerId || undefined, {
    resolve: {
      items: true,
    },
  })
  const items = container?.items

  // If no id parameter, generate a UUID and redirect
  useEffect(() => {
    if (!containerId) {
      const newId = crypto.randomUUID()
      console.log("Creating container")
      const group = Group.create()
      group.makePublic("writer")
      const newContainer = TestContainer.create(
        {
          title: "Test Container",
          items: co.list(TestItem).create([], { owner: me._owner }),
          totalItems: 0,
          createdAt: Date.now(),
        },
        {
          owner: group,
          unique: newId,
        }
      )
      setTimeout(() => {
        window.location.href = `${window.location.origin}${window.location.pathname}?id=${newContainer.id}`
      }, 1000)
      return
    }
  }, [containerId])

  // Interval that always runs but only executes logic when conditions are met
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Interval running every 100ms")
      if (containerId && items && items.length < 30000) {
        // Add 10 items to the list when length is less than 30,000
        console.log(`Current items: ${items.length}, adding 10 more items`)
        // Create all 10 items first
        const newItems = []
        for (let i = 0; i < 1000; i++) {
          const newItem = TestItem.create(
            createTestItem(items.length + i + 1),
            { owner: items._owner }
          )
          newItems.push(newItem)
        }

        // Push all items in batch
        items.push(...newItems)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [containerId, items])

  // If we don't have an id yet, show loading while redirect happens
  if (!containerId) {
    return (
      <div className="app-loading">
        <h2>Generating container...</h2>
        <div className="spinner"></div>
      </div>
    )
  }

  if (!container) {
    return (
      <div className="app-loading">
        <h2>Loading...</h2>
        <div className="spinner"></div>
      </div>
    )
  }

  if (!items) {
    return (
      <div className="app-loading">
        <h2>Loading items...</h2>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2>Container: {containerId}</h2>
        <p>Share this URL to collaborate: {window.location.href}</p>
      </div>
      <h3>Items ({items.length}):</h3>
      {/* <ul>
        {items.map((item) => {
          if (!item) return <div>Loading...</div>
          return <li key={item.id}>{item.id}</li>
        })}
      </ul> */}
    </div>
  )
}
