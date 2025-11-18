import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileCheck, Download, Eye, Copy } from 'lucide-react'

function TemplatesPage() {
  const templates = [
    { id: 1, name: 'Employment Contract', category: 'Labor', language: 'Arabic/English', downloads: 245, format: 'DOCX' },
    { id: 2, name: 'Commercial Agreement', category: 'Commercial', language: 'Arabic/English', downloads: 189, format: 'DOCX' },
    { id: 3, name: 'Power of Attorney', category: 'Civil', language: 'Arabic', downloads: 156, format: 'PDF' },
    { id: 4, name: 'Lease Agreement', category: 'Real Estate', language: 'Arabic/English', downloads: 134, format: 'DOCX' },
    { id: 5, name: 'Client Retainer Agreement', category: 'General', language: 'Arabic/English', downloads: 298, format: 'DOCX' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">النماذج - Templates</h1>
        <p className="text-muted-foreground mt-2">
          Legal document templates and forms
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm">All Categories</Button>
        <Button variant="outline" size="sm">Labor</Button>
        <Button variant="outline" size="sm">Commercial</Button>
        <Button variant="outline" size="sm">Civil</Button>
        <Button variant="outline" size="sm">Real Estate</Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FileCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge>{template.category}</Badge>
                        <Badge variant="outline">{template.language}</Badge>
                        <Badge variant="outline">{template.format}</Badge>
                        <span className="text-xs">{template.downloads} downloads</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button size="sm" variant="outline">
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/knowledge/templates')({
  component: TemplatesPage,
})
