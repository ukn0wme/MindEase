import ResourceList from "@/components/resource-list"

export default function ResourcesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Mental Health Resources</h1>
      <p className="text-muted-foreground mb-8">Helpful articles, guides, and tools for your mental wellbeing</p>

      <ResourceList />

      <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
        <h2 className="text-xl font-semibold mb-4">Need immediate help?</h2>
        <p className="mb-4">
          If you're experiencing a mental health crisis or need immediate support, please reach out to one of these
          resources in Kazakhstan:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong>Kazakhstan Emergency Services:</strong> 103 (Ambulance)
          </li>
          <li>
            <strong>Mental Health Helpline:</strong> +7 (7172) 742-999
          </li>
          <li>
            <strong>Republican Scientific and Practical Center for Mental Health:</strong> +7 (7172) 549-762
          </li>
          <li>
            <strong>Crisis Hotline "Telefon Doveria":</strong> 150
          </li>
        </ul>
      </div>
    </div>
  )
}

