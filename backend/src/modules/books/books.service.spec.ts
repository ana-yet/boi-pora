import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BooksService } from './books.service';
import { Book } from '../../schemas/book.schema';
import { BookStatus } from '../../common/enums';

/** Chainable query stub that records what the service asked for. */
function queryStub(result: unknown) {
  const q: Record<string, jest.Mock> = {};
  for (const m of ['sort', 'skip', 'limit', 'lean']) {
    q[m] = jest.fn(() => q);
  }
  q.exec = jest.fn(() => Promise.resolve(result));
  return q;
}

describe('BooksService', () => {
  let service: BooksService;
  let bookModel: {
    find: jest.Mock;
    countDocuments: jest.Mock;
  };
  let lastQuery: ReturnType<typeof queryStub>;

  beforeEach(async () => {
    bookModel = {
      find: jest.fn(() => {
        lastQuery = queryStub([]);
        return lastQuery;
      }),
      countDocuments: jest.fn(() => ({ exec: () => Promise.resolve(0) })),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getModelToken(Book.name), useValue: bookModel },
      ],
    }).compile();
    service = moduleRef.get(BooksService);
  });

  describe('findAll (public)', () => {
    it('always filters to published books', async () => {
      await service.findAll();
      const filter = bookModel.find.mock.calls[0][0];
      expect(filter.status).toBe(BookStatus.PUBLISHED);
    });

    it('cannot be widened by callers — there is no status parameter', async () => {
      await service.findAll(1, 20, 'fiction', 'rating', undefined);
      const filter = bookModel.find.mock.calls[0][0];
      expect(filter.status).toBe(BookStatus.PUBLISHED);
      expect(filter.category).toBe('fiction');
    });

    it('caps limit at 100', async () => {
      await service.findAll(1, 5000);
      expect(lastQuery.limit).toHaveBeenCalledWith(100);
    });

    it('escapes regex special characters in search', async () => {
      await service.findAll(1, 20, undefined, undefined, 'c++ (vol. 2)');
      const filter = bookModel.find.mock.calls[0][0];
      const regex: RegExp = filter.$or[0].title;
      expect(regex.source).toBe('c\\+\\+ \\(vol\\. 2\\)');
      expect(regex.test('Learning C++ (Vol. 2)')).toBe(true);
      expect(regex.test('cxx vol 2')).toBe(false);
    });
  });

  describe('findAllAdmin', () => {
    it('applies a valid status filter', async () => {
      await service.findAllAdmin(1, 20, undefined, BookStatus.DRAFT);
      const filter = bookModel.find.mock.calls[0][0];
      expect(filter.status).toBe(BookStatus.DRAFT);
    });

    it('ignores an invalid status (returns all)', async () => {
      await service.findAllAdmin(1, 20, undefined, 'not-a-status');
      const filter = bookModel.find.mock.calls[0][0];
      expect(filter.status).toBeUndefined();
    });
  });

  describe('sort map', () => {
    const cases: Array<[string | undefined, Record<string, 1 | -1>]> = [
      ['rating', { rating: -1 }],
      ['ratingCount', { ratingCount: -1 }],
      ['createdAt', { createdAt: -1 }],
      ['oldest', { createdAt: 1 }],
      ['title_desc', { title: -1 }],
      ['title_asc', { title: 1 }],
      [undefined, { title: 1 }],
      ['garbage', { title: 1 }],
    ];

    it.each(cases)('sort=%s → %o', async (sort, expected) => {
      await service.findAll(1, 20, undefined, sort);
      expect(lastQuery.sort).toHaveBeenCalledWith(expected);
    });
  });

  describe('search', () => {
    it('only returns published books for empty queries', async () => {
      await service.search('');
      const filter = bookModel.find.mock.calls[0][0];
      expect(filter.status).toBe(BookStatus.PUBLISHED);
    });

    it('keeps the published filter on the regex fallback path', async () => {
      // Short single token skips the $text branch entirely.
      await service.search('c+');
      const filter = bookModel.find.mock.calls[0][0];
      expect(filter.status).toBe(BookStatus.PUBLISHED);
      const regex: RegExp = filter.$or[0].title;
      expect(regex.source).toBe('c\\+');
    });
  });

  describe('findBySlug', () => {
    function findOneReturning(book: unknown) {
      return jest.fn(() => ({
        lean: () => ({ exec: () => Promise.resolve(book) }),
      }));
    }

    it('hides drafts from the public', async () => {
      (bookModel as Record<string, unknown>).findOne = findOneReturning({
        slug: 'x',
        status: BookStatus.DRAFT,
      });
      await expect(service.findBySlug('x')).rejects.toThrow('Book not found');
    });

    it('returns drafts when includeUnpublished is set (admin)', async () => {
      (bookModel as Record<string, unknown>).findOne = findOneReturning({
        slug: 'x',
        status: BookStatus.DRAFT,
      });
      await expect(service.findBySlug('x', true)).resolves.toMatchObject({
        slug: 'x',
      });
    });
  });
});
