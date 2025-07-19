"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Location {
  display_name: string
  lat: string
  lon: string
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void
  placeholder?: string
}

export function LocationPicker({ onLocationSelect, placeholder = "Search for location..." }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error searching location:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = () => {
    searchLocation(searchQuery)
  }

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location)
    // Simplify location display for the search input
    const addressParts = location.display_name.split(', ')
    const simplifiedLocation = addressParts.slice(-3).join(', ')
    setSearchQuery(simplifiedLocation)
    setSearchResults([])
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          <Search size={16} />
        </Button>
      </div>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Search Results</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {searchResults.map((location, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start gap-2 h-auto p-2"
                  onClick={() => handleLocationSelect(location)}
                >
                  <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-left text-sm">
                    {(() => {
                      const addressParts = location.display_name.split(', ')
                      return addressParts.slice(-3).join(', ')
                    })()}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 