import { getDb } from '../db/connect.js';

const getAllBooks = async (limit = 50, offset = 0) => {
  const db = getDb();
  const collection = db.collection('books');
  const books = await collection.find({})
    .sort({ id: 1 })
    .skip(offset)
    .limit(limit)
    .toArray();
  return books;
};

const getBookById = async (bookId) => {
  const db = getDb();
  const collection = db.collection('books');
  const book = await collection.findOne({ id: bookId });
  return book;
};

const createBook = async (book) => {
  const db = getDb();
  const collection = db.collection('books');
  await collection.insertOne(book);
  return book;
};

const updateBook = async (bookId, book) => {
  const db = getDb();
  const collection = db.collection('books');
  const result = await collection.updateOne({ id: bookId }, { $set: book });

  if (result.matchedCount === 0) {
    return null;
  }

  return getBookById(bookId);
};

const deleteBook = async (bookId) => {
  const db = getDb();
  const collection = db.collection('books');
  return collection.deleteOne({ id: bookId });
};

const authorExists = async (authorId) => {
  const db = getDb();
  const collection = db.collection('authors');
  const author = await collection.findOne({ id: authorId }, { projection: { _id: 1 } });
  return Boolean(author);
};

export { getAllBooks, getBookById, createBook, updateBook, deleteBook, authorExists };