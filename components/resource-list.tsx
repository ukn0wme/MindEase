"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ExternalLink, BookOpen, FileText } from "lucide-react"
import { supabase } from "@/utils/supabase"
import { Badge } from "@/components/ui/badge"

export default function ResourceList() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("mental_health_resources").select("*").order("title")

      if (error) throw error

      if (data) {
        setResources(data)

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((item) => item.category)))
        setCategories(uniqueCategories as string[])
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = selectedCategory
    ? resources.filter((resource) => resource.category === selectedCategory)
    : resources

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden">
            <CardContent className="p-0">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {resource.type === "article" ? (
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{resource.title}</h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground ml-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    <Badge variant="outline" className="mt-2">
                      {resource.category}
                    </Badge>
                  </div>
                </div>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No resources found for this category.</p>
        </div>
      )}
    </div>
  )
}

