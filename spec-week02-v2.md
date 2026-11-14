# Books API week 2 spec - version 2

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger. Data Model Book documents will be stored in the books collection.

Required book fields: 
- `id`: string, required, custom ID such as `b1` 
- `authorId`: string, required, references the `id` field of an author document 
- `title`: string, required 
- `publicationDate`: string,required, real date in `YYYY-MM-DD format`

Books will continue to use custom string IDs instead of MongoDB _`id`values for route parameters.

### Relationship to Authors
Each book identifies its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book: 
- The API must check that the referenced author exists. 
- If the author does not exist, return `400` with an error message. 
- The API must not store the author's name directly in the book document.

An index on books.authorId should support author-reference lookups and deletion checks.

### Routes

#### GET /books
Purpose: Return all books.

Query parameters: 
- limit (optional): defaults to `50`, maximum 100 
- offset (optional): defaults to `0`

Success: 
- Status code: `200` 
- Response body: an array of book objects,sorted by `id` ascending

Example response:
    [
        {
            "id": "b1",
            "authorId": "a1",
            "title": "Things Fall Apart",
            "publicationDate": "1958-06-17"
        }
    ]

Errors: 
- `400` if pagination values are invalid 
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom ID.

Success: 
- Status code: `200` 
- Response body: the matching book object

Errors: 
- 404 if no book exists with that ID 
- 500 if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:
    {
    "id": "b4",
    "authorId": "a1",
    "title": "Example Book Title",
    "publicationDate": "2026-01-15"
    }

Success: 
- Status code: `201` 
- Response body: the newly created book object, including its custom `id`

Errors: 
- `400` if a required field is missing, has the wrong type, is empty, or publicationDate is not a real date in YYYY-MM-DD format 
- `400` if authorId does not match an existing author 
- `409` if the custom book id already exists 
- `500` if an unexpected server ordatabase error occurs

#### PUT /books/:id
Purpose: Replace the editable data for an existing book. This is a full update, not a partial update. The custom id is taken from the URL and cannot be changed.

Request body:
    {
    "authorId": "a2",
    "title": "Updated Book Title",
    "publicationDate": "2026-02-20"
    }

Success: 
- Status code: `200` 
- Response body: the updated book object

Errors: 
- `400` if a required field is missing, has the wrong type, is empty, or publicationDate is not a real date in YYYY-MM-DD format 
- `400` if authorId does not match an existing author 
- `404` if no book exists with that ID 
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success: 
- Status code: `204` 
- Response body: none

Errors: 
- `404` if no book exists with that ID 
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route using OpenAPI 3. Documentation
must include: 
- Tags, summaries, and descriptions 
- Path and query parameters 
- Request-body schemas and examples for POST and PUT 
- Success response codes and response schemas/examples 
- Error response codes and the standard JSON error schema 
- The `204` DELETE response with no response body

Every book route must be testable from the Swagger UI at `/api-docs.`

### Deployment Expectations
Book routes must work locally and on the deployed Render application.
The deployed Swagger page at `/api-docs` must allow users to test every book route.

<!-- Authors API Spec - Version 2 -->

## Feature 2: Author CRUD Operations

### Goal
Add an authors API that supports all CRUD operations for author documents. Each author has a custom string ID, a name, and a birth year. Every author route must be documented and testable in Swagger.

### Data Model
Author documents will be stored in the authors collection.

Required author fields: 
- `id`: string, required, custom ID such as `a1` 
- `name`: string, required, non-empty after trimming 
- `birthYear`: number, required, integer from `1000` through the current year

Authors will continue to use custom string IDs instead of MongoDB _`id` values for route parameters.

### Relationship to Books
Books reference authors through the book document's `authorId` field. The `authorId` value must match an author's custom `id`.

An author cannot be deleted while one or more books reference that author's `id`. 
- Before deleting an author, the API must check the books collection for matching `authorId` values. 
- If at least one book references the author, return `409` Conflict with the standard JSON error shape and a clear message. 
- The author must not be deleted in this case. 
- The client must delete or update the referencing books before trying again.

This rule prevents books from being left with references to an author that no longer exists. The deletion check and delete operation should be performed safely to reduce the chance of a book being added between the check and deletion.

### Routes

#### GET /authors
Purpose: Return all authors.

Query parameters: 
- limit (optional): defaults to `50`, maximum 100 
- offset (optional): defaults to `0`

Success: 
- Status code: `200` 
- Response body: an array of author objects, sorted by id ascending

Example response:
    [
        {
            "id": "a1",
            "name": "Chinua Achebe",
            "birthYear": 1930
        }
    ]

Errors: 
- `400` if pagination values are invalid 
- `500` if an unexpected server or database error occurs

#### GET /authors/:id
Purpose: Return one author by their custom ID.

Success: 
- Status code: `200` 
- Response body: the matching author object

Errors: 
- `404` if no author exists with that ID 
- `500` if an unexpected server or database error occurs

#### POST /authors
Purpose: Create a new author.

Request body:
    {
    "id": "a1",
    "name": "Chinua Achebe",
    "birthYear": 1930
    }

Success: 
- Status code: `201` 
- Response body: the newly created authorobject

Errors: 
- `400` if a required field is missing, has the wrong type, is empty, or birthYear is not a valid integer in the allowed range 
- `409` if the custom author id already exists 
- `500` if an unexpected server or database error occurs

#### PUT /authors/:id
Purpose: Replace the editable data for an existing author. This is a full update, not a partial update. The custom id is taken from the URL and cannot be changed.

Request body:
    {
    "name": "Chinua Achebe",
    "birthYear": 1930
    }

Success: 
- Status code: `200` 
- Response body: the updated author object

Errors: 
- `400` if a required field is missing, has the wrong type, is empty, or birthYear is not a valid integer in the allowed range 
- `404` if no author exists with that ID 
- `500` if an unexpected server or database error occurs

#### DELETE /authors/:id
Purpose: Delete an existing author only if no books reference that author's custom ID.

Success: 
- Status code: `204` 
- Response body: none

Errors: 
- `404` if no author exists with that ID 
- `409` if one or more books still reference the author. 

Example response:
    {
    "error": "Cannot delete author because one or more books reference this author."
    }

- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every author route using `OpenAPI 3`. Documentationmust include: 
- Tags, summaries, and descriptions 
- Path and query parameters 
- Request-body schemas and examples for POST and PUT 
- Success response codes and response schemas/examples 
- Error response codes and the standard JSON error schema 
- The `204` DELETE response with no response body

Every author route must be testable from the Swagger UI at `/api-docs.`

### Deployment Expectations
Author routes must work locally and on the deployed Render application. The deployed Swagger page at `/api-docs` must allow users to test every author route.