import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  authorExists,
} from '../model/books.js';

const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isValidPublicationDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const validateBook = (book, includeId = false) => {
  if (!book || typeof book !== 'object' || Array.isArray(book)) {
    return 'A JSON object is required.';
  }

  if (includeId && !isNonEmptyString(book.id)) {
    return 'A non-empty string id is required.';
  }

  if (!isNonEmptyString(book.authorId)) {
    return 'A non-empty string authorId is required.';
  }

  if (!isNonEmptyString(book.title)) {
    return 'A non-empty string title is required.';
  }

  if (typeof book.publicationDate !== 'string' || !isValidPublicationDate(book.publicationDate)) {
    return 'publicationDate must be a real date in YYYY-MM-DD format.';
  }

  return null;
};

const getBookFields = (body) => {
  return {
    authorId: body.authorId.trim(),
    title: body.title.trim(),
    publicationDate: body.publicationDate,
  };
};

const getBooksHandler = async (req, res) => {
  const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
  const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({ message: 'limit must be an integer from 1 to 100.' });
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return res.status(400).json({ message: 'offset must be a non-negative integer.' });
  }

  try {
    const books = await getAllBooks(limit, offset);
    return res.status(200).json(books);
  } catch (error) {
    console.error('GET /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Controller function for GET /books/:id route
const getBookByIdHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const book = await getBookById(requestedId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('GET /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createBookHandler = async (req, res) => {
  const validationError = validateBook(req.body, true);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const book = {
    id: req.body.id.trim(),
    ...getBookFields(req.body),
  };

  try {
    if (await getBookById(book.id)) {
      return res.status(400).json({ message: 'Book id already exists.' });
    }

    if (!(await authorExists(book.authorId))) {
      return res.status(400).json({ message: 'authorId does not match an existing author.' });
    }

    const createdBook = await createBook(book);
    return res.status(201).json(createdBook);
  } catch (error) {
    console.error('POST /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBookHandler = async (req, res) => {
  const { id } = req.params;
  const validationError = validateBook(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    if (!(await getBookById(id))) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = getBookFields(req.body);
    if (!(await authorExists(book.authorId))) {
      return res.status(400).json({ message: 'authorId does not match an existing author.' });
    }

    const updatedBook = await updateBook(id, book);
    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(updatedBook);
  } catch (error) {
    console.error('PUT /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBookHandler = async (req, res) => {
  try {
    const result = await deleteBook(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('DELETE /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getBooksHandler,
  getBookByIdHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
};