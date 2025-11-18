import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gavel, Search, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'

function JudgmentsPage() {
  const judgments = [
    { id: 1, caseNo: 'SC-2024-1234', title: 'Contract Breach - Force Majeure', court: 'Supreme Court', date: '2024-11-05', category: 'Commercial' },
    { id: 2, caseNo: 'AC-2024-5678', title: 'Wrongful Termination', court: 'Appeal Court', date: '2024-10-22', category: 'Labor' },
    { id: 3, caseNo: 'SC-2024-3456', title: 'Property Dispute Resolution', court: 'Supreme Court', date: '2024-09-15', category: 'Real Estate' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الأحكام - Judgments</h1>
        <p className="text-muted-foreground mt-2">
          Judicial precedents and court rulings
        </p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input placeholder="Search judgments..." className="w-full" />
        </div>
        <Button variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm">All Courts</Button>
        <Button variant="outline" size="sm">Supreme Court</Button>
        <Button variant="outline" size="sm">Appeal Court</Button>
        <Button variant="outline" size="sm">District Court</Button>
      </div>

      <div className="grid gap-4">
        {judgments.map((judgment) => (
          <Card key={judgment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Gavel className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{judgment.title}</CardTitle>
                      <Badge>{judgment.category}</Badge>
                    </div>
                    <CardDescription>
                      <div className="space-y-1">
                        <p>Case No: <span className="font-mono">{judgment.caseNo}</span></p>
                        <p>Court: {judgment.court}</p>
                        <p>Date: {judgment.date}</p>
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
                  View Full Judgment
                </Button>
                <Button size="sm" variant="outline">Download PDF</Button>
                <Button size="sm" variant="outline">Related Cases</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/knowledge/judgments')({
  component: JudgmentsPage,
})
