import { http, HttpResponse } from 'msw'

// Auth routes are NOT versioned - they're at /api/auth/*, not /api/v1/auth/*
const AUTH_URL = 'http://localhost:3000/api'
const API_URL = 'http://localhost:3000/api/v1'

export const handlers = [
  // Auth handlers (non-versioned)
  http.post(`${AUTH_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        user: { id: '1', email: body.email, name: 'Test User', role: 'lawyer' },
        token: 'mock-token',
      })
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  http.get(`${AUTH_URL}/auth/me`, () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'lawyer',
    })
  }),

  http.post(`${AUTH_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true })
  }),

  // Clients handlers
  http.get(`${API_URL}/clients`, () => {
    return HttpResponse.json({
      clients: [
        { id: '1', name: 'Client 1', email: 'client1@test.com' },
        { id: '2', name: 'Client 2', email: 'client2@test.com' },
      ],
      total: 2,
    })
  }),

  http.post(`${API_URL}/clients`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: '3', ...body }, { status: 201 })
  }),

  // Cases handlers
  http.get(`${API_URL}/cases`, () => {
    return HttpResponse.json({
      cases: [
        { id: '1', title: 'Case 1', status: 'open' },
        { id: '2', title: 'Case 2', status: 'pending' },
      ],
      total: 2,
    })
  }),

  // Tasks handlers
  http.get(`${API_URL}/tasks`, () => {
    return HttpResponse.json({
      tasks: [
        { id: '1', title: 'Task 1', completed: false },
        { id: '2', title: 'Task 2', completed: true },
      ],
    })
  }),

  // Rate limit test handler
  http.get(`${API_URL}/rate-limited`, () => {
    return HttpResponse.json(
      { message: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }),
]
