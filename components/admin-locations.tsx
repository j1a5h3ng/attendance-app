"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Plus, Save, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { officeLocations } from "@/config/locations"
import { locationColors } from "@/config/colors"

type Location = {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  colorIndex?: number
}

export default function AdminLocations() {
  const { toast } = useToast()
  const [locations, setLocations] = useState<Location[]>(officeLocations)
  const [newLocation, setNewLocation] = useState({
    id: "",
    name: "",
    latitude: "",
    longitude: "",
    radius: "100",
    colorIndex: "0",
  })
  const [isAdding, setIsAdding] = useState(false)

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude || !newLocation.radius) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const locationId = newLocation.name.toLowerCase().replace(/\s+/g, "-")
    const colorIndex = locations.length % locationColors.length

    const locationToAdd: Location = {
      id: locationId,
      name: newLocation.name,
      latitude: Number.parseFloat(newLocation.latitude),
      longitude: Number.parseFloat(newLocation.longitude),
      radius: Number.parseInt(newLocation.radius),
      colorIndex: newLocation.colorIndex ? Number.parseInt(newLocation.colorIndex) : colorIndex,
    }

    setLocations([...locations, locationToAdd])
    setNewLocation({
      id: "",
      name: "",
      latitude: "",
      longitude: "",
      radius: "100",
      colorIndex: "0",
    })
    setIsAdding(false)

    toast({
      title: "Location added",
      description: `${newLocation.name} has been added as a check-in location.`,
    })
  }

  const handleRemoveLocation = (id: string) => {
    setLocations(locations.filter((location) => location.id !== id))

    toast({
      title: "Location removed",
      description: "The location has been removed from check-in locations.",
    })
  }

  const handleGetCurrentLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewLocation({
            ...newLocation,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          })

          toast({
            title: "Current location captured",
            description: "Your current coordinates have been added to the form.",
          })
        },
        () => {
          toast({
            title: "Location error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive",
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )
    }
  }

  const handleSaveAllLocations = () => {
    toast({
      title: "Locations saved",
      description: `${locations.length} check-in locations have been saved.`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Check-in Locations</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 rounded-full" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Location
          </Button>
          <Button size="sm" className="h-8 rounded-full" onClick={handleSaveAllLocations}>
            <Save className="h-4 w-4 mr-1" />
            Save All
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="rounded-xl overflow-hidden shadow-sm">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-medium">Add New Location</h3>

            <div className="space-y-2">
              <Label htmlFor="location-name" className="text-sm">
                Location Name
              </Label>
              <Input
                id="location-name"
                placeholder="Main Office"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                className="rounded-lg h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-sm">
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  placeholder="37.7749"
                  value={newLocation.latitude}
                  onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })}
                  className="rounded-lg h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-sm">
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  placeholder="-122.4194"
                  value={newLocation.longitude}
                  onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })}
                  className="rounded-lg h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="radius" className="text-sm">
                Radius (meters)
              </Label>
              <Input
                id="radius"
                type="number"
                placeholder="100"
                value={newLocation.radius}
                onChange={(e) => setNewLocation({ ...newLocation, radius: e.target.value })}
                className="rounded-lg h-10"
              />
              <p className="text-xs text-gray-500">Employees can check in within this distance from the location</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location-color" className="text-sm">
                Location Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {locationColors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`w-8 h-8 rounded-full ${color.bg} ${
                      newLocation.colorIndex === index.toString() ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    onClick={() => setNewLocation({ ...newLocation, colorIndex: index.toString() })}
                    aria-label={`Color ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-full h-10" onClick={handleGetCurrentLocation}>
                <MapPin className="h-4 w-4 mr-1" />
                Use Current Location
              </Button>
              <Button className="flex-1 rounded-full h-10" onClick={handleAddLocation}>
                Add Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {locations.map((location, index) => {
          const colorIndex = location.colorIndex !== undefined ? location.colorIndex : index % locationColors.length

          return (
            <Card key={location.id || index} className="rounded-xl overflow-hidden shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${locationColors[colorIndex].bg}`}></div>
                    <div>
                      <h3 className="text-sm font-medium">{location.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {typeof location.latitude === "number" ? location.latitude.toFixed(6) : location.latitude},
                        {typeof location.longitude === "number" ? location.longitude.toFixed(6) : location.longitude}
                      </p>
                      <p className="text-xs text-gray-500">Radius: {location.radius} meters</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-red-500"
                    onClick={() => handleRemoveLocation(location.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
