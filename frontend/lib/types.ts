export interface ApiBook {
  _id: string;
  title: string;
  slug: string;
  author: string;
  authors?: string[];
  description?: string;
  coverImageUrl?: string;
  category?: string;
  language?: string;
  genres?: string[];
  pageCount?: number;
  estimatedReadTimeMinutes?: number;
  rating?: number;
  ratingCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  _id: string;
  bookId: string;
  chapterNumber: number;
  chapterId: string;
  title: string;
  content: string;
  wordCount?: number;
  order?: number;
}

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface ReviewItem {
  _id: string;
  userId: { _id: string; name?: string };
  rating: number;
  content?: string;
  createdAt: string;
}

export interface LibraryBookRef {
  _id: string;
  title: string;
  slug: string;
  author: string;
  coverImageUrl?: string;
  category?: string;
}

export interface LibraryItem {
  _id: string;
  bookId: LibraryBookRef;
  status?: string;
  addedAt?: string;
}

export interface ProgressBook {
  _id: string;
  title: string;
  slug: string;
  author: string;
  coverImageUrl?: string;
  category?: string;
}

export interface ProgressChapter {
  _id: string;
  title?: string;
  chapterNumber?: number;
}

export interface ProgressItem {
  _id: string;
  bookId: ProgressBook;
  chapterId?: ProgressChapter;
  percentComplete?: number;
  lastReadAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type BooksResponse = PaginatedResponse<ApiBook>;
export type LibraryResponse = PaginatedResponse<LibraryItem>;
export type ReviewsResponse = PaginatedResponse<ReviewItem>;
