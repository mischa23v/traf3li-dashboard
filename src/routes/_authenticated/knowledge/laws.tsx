import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Search, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'

function LawsPage() {
  const laws = [
    { id: 1, title: 'Saudi Labor Law', code: 'M/51', year: '2005', category: 'Labor', articles: 245 },
    { id: 2, title: 'Commercial Companies Law', code: 'M/3', year: '2015', category: 'Commercial', articles: 232 },
    { id: 3, title: 'Real Estate Law', code: 'M/6', year: '2020', category: 'Real Estate', articles: 78 },
    { id: 4, title: 'Contract Law', code: 'M/15', year: '2018', category: 'Civil', articles: 156 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">القوانين - Laws</h1>
        <p className="text-muted-foreground mt-2">
          Saudi legal framework and regulations
        </p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input placeholder="Search laws..." className="w-full" />
        </div>
        <Button variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm">All Categories</Button>
        <Button variant="outline" size="sm">Labor</Button>
        <Button variant="outline" size="sm">Commercial</Button>
        <Button variant="outline" size="sm">Civil</Button>
        <Button variant="outline" size="sm">Real Estate</Button>
      </div>

      <div className="grid gap-4">
        {laws.map((law) => (
          <Card key={law.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle>{law.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">Code: {law.code}</Badge>
                        <Badge variant="outline">Year: {law.year}</Badge>
                        <Badge>{law.category}</Badge>
                        <span className="text-xs">{law.articles} Articles</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  View Full Text
                </Button>
                <Button size="sm" variant="outline">Search Articles</Button>
                <Button size="sm" variant="outline">Download PDF</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/knowledge/laws')({
  component: LawsPage,
})
