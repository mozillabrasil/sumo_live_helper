// TODO:
// - Create our own bundle of faker
import { faker } from '../vendor/faker.js';

export default function mock() {
  const response = {
    "count": 0,
    "next": null,
    "previous": null,
    "results": [],
  }
  const limit_results = 20;

  for (let i = 0; i < limit_results; i++) {
    response.results.push({
      "answers": [],
      "created": "2025-10-20T13:28:24.769350Z",
      "id": i,
      "is_archived": false,
      "is_locked": false,
      "is_solved": false,
      "is_spam": false,
      "is_taken": false,
      "last_answer": null,
      "locale": "en-US",
      "num_answers": 0,
      "product": "firefox",
      "solution": null,
      "solved_by": null,
      "title": faker.lorem.words({ min: 5, max: 15 }),
    });
  }

  return response;
}
