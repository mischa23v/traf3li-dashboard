import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, MapPin, Clock } from 'lucide-react'

function BrowseJobsPage() {
  const jobs = [
    { id: 1, title: 'Commercial Contract Review', company: 'ABC Trading Co.', location: 'Riyadh', budget: '3000-5000 SAR', type: 'Contract', posted: '2 days ago' },
    { id: 2, title: 'Employment Dispute Consultation', company: 'Tech Startup', location: 'Jeddah', budget: '2000-3000 SAR', type: 'Consultation', posted: '3 days ago' },
    { id: 3, title: 'Real Estate Transaction Legal Support', company: 'Property Group', location: 'Dammam', budget: '5000-8000 SAR', type: 'Real Estate', posted: '5 days ago' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">تصفح الوظائف - Browse Jobs</h1>
        <p className="text-muted-foreground mt-2">
          Find legal opportunities matching your expertise
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline">All Categories</Button>
        <Button variant="outline">Contract Law</Button>
        <Button variant="outline">Consultation</Button>
        <Button variant="outline">Real Estate</Button>
        <Button variant="outline">Commercial</Button>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle>{job.title}</CardTitle>
                    <Badge>{job.type}</Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    <p className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3" />
                      {job.company}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Posted {job.posted}
                    </p>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="text-lg font-bold">{job.budget}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button>Apply Now</Button>
                <Button variant="outline">View Details</Button>
                <Button variant="outline">Save</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/jobs/browse')({
  component: BrowseJobsPage,
})
