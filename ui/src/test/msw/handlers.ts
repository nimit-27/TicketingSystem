import { http, HttpResponse } from 'msw';

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:8082';

export const handlers = [
  http.get(`${API_URL}/tickets`, () => {
    return HttpResponse.json({ data: [] });
  }),
  http.post(`${API_URL}/tickets/add`, async ({ request }) => {
    const body = request instanceof Request ? await request.formData() : null;
    const subject = body?.get('subject') ?? 'New ticket';
    return HttpResponse.json({ id: 'TICK-100', subject });
  }),
];
