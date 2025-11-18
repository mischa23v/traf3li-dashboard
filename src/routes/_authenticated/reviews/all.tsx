import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, User } from 'lucide-react'

function AllReviewsPage() {
  const reviews = [
    { id: 1, author: 'Ahmed Al-Rashid', rating: 5, comment: 'Excellent legal service. Very professional and knowledgeable.', date: '2025-11-15', case: 'Commercial Dispute' },
    { id: 2, author: 'Sarah Al-Saud', rating: 5, comment: 'Helped me resolve my employment issue quickly. Highly recommended!', date: '2025-11-10', case: 'Employment Case' },
    { id: 3, author: 'Mohammed Al-Qahtani', rating: 4, comment: 'Good service, but could improve communication timelines.', date: '2025-11-05', case: 'Property Case' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">جميع التقييمات - All Reviews</h1>
        <p className="text-muted-foreground mt-2">
          All client feedback and ratings
        </p>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{review.author}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <Badge variant="outline">{review.case}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.date}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/reviews/all')({
  component: AllReviewsPage,
})
