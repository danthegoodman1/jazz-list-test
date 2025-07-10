import { useAccount, useCoState } from "jazz-tools/react"
import "./App.css"
import { co, Group } from "jazz-tools"
import { TestContainer, TestItem, createTestItem } from "./schema"
import { useEffect, useState, useRef } from "react"
import { FixedSizeList as List } from "react-window"
import QRCode from "qrcode"

export default function App() {
  const { me } = useAccount()
  const [scrollToIndex, setScrollToIndex] = useState("")
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("")
  const listRef = useRef<List>(null)

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
          items: co.list(TestItem).create([], { owner: group }),
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
      if (containerId && items && items.length < 40000) {
        // Add 10 items to the list when length is less than 40,000
        console.log(`Current items: ${items.length}, adding more items`)
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
    }, 1000)

    return () => clearInterval(interval)
  }, [containerId, items])

  // Generate QR code when we have a container ID
  useEffect(() => {
    if (containerId) {
      const currentUrl = window.location.href
      QRCode.toDataURL(currentUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => {
          setQrCodeDataUrl(url)
        })
        .catch((err) => {
          console.error("Error generating QR code:", err)
        })
    }
  }, [containerId])

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

  // Function to scroll to a specific index
  const handleScrollToIndex = () => {
    const index = parseInt(scrollToIndex) - 1 // Convert to 0-based index
    if (
      listRef.current &&
      !isNaN(index) &&
      index >= 0 &&
      index < items.length
    ) {
      listRef.current.scrollToItem(index, "center")
    }
  }

  // Row component for virtual list
  const Row = ({
    index,
    style,
  }: {
    index: number
    style: React.CSSProperties
  }) => {
    const item = items[index]
    return (
      <div style={style}>
        <div style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
          {item
            ? `Item ${index + 1}: ${item.id} '${item.newThing}'`
            : "Loading..."}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2>Container: {containerId}</h2>
        <p>Share this URL to collaborate: {window.location.href}</p>
        {qrCodeDataUrl && (
          <div style={{ marginTop: "10px" }}>
            <p>Or scan this QR code:</p>
            <img
              src={qrCodeDataUrl}
              alt="QR Code for sharing"
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                backgroundColor: "white",
              }}
            />
          </div>
        )}
      </div>
      <h3>Items ({items.length}):</h3>
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="number"
          value={scrollToIndex}
          onChange={(e) => setScrollToIndex(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScrollToIndex()}
          placeholder="Enter item number..."
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "200px",
          }}
        />
        <button
          onClick={handleScrollToIndex}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Scroll to Item
        </button>
      </div>
      <div style={{ height: "400px", width: "100%" }}>
        <List
          ref={listRef}
          height={400}
          itemCount={items.length}
          itemSize={50}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  )
}
