import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { bookApi } from '@/api/bookApi';
import { Search, Book, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const SearchBar = ({ className }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await bookApi.searchBooks(searchQuery);
        const books = response?.data || response || [];
        setSearchResults(Array.isArray(books) ? books.slice(0, 8) : []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const saveRecentSearch = (bookTitle) => {
    const updated = [
      bookTitle,
      ...recentSearches.filter((s) => s !== bookTitle)
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSelectBook = (book) => {
    saveRecentSearch(book.title);
    setOpen(false);
    setSearchQuery('');
    navigate(`/books/${book.id}`);
  };

  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    setOpen(true);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'relative flex items-center w-full max-w-2xl',
            className
          )}
        >
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Tìm kiếm sách theo tên, tác giả, thể loại..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className="w-full h-12 pl-10 pr-4 rounded-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[--radix-popover-trigger-width]"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {!searchQuery && recentSearches.length > 0 && (
              <CommandGroup heading="Tìm kiếm gần đây">
                {recentSearches.map((search, index) => (
                  <CommandItem
                    key={index}
                    value={search}
                    onSelect={() => handleRecentSearch(search)}
                    className="cursor-pointer"
                  >
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{search}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchQuery && searchQuery.trim().length >= 2 && (
              <>
                {isSearching ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Đang tìm kiếm...
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <CommandGroup heading="Kết quả tìm kiếm">
                    {searchResults.map((book) => (
                      <CommandItem
                        key={book.id}
                        value={book.title}
                        onSelect={() => handleSelectBook(book)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-shrink-0 w-10 h-14 bg-gray-100 rounded overflow-hidden">
                            {book.coverImage && book.coverImage !== 'string' ? (
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Book className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {book.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {book.author}
                            </p>
                          </div>
                          {book.price && (
                            <div className="flex-shrink-0 text-sm font-semibold text-primary">
                              {Number(book.price).toLocaleString('vi-VN')}đ
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandEmpty>
                    <div className="py-6 text-center">
                      <Book className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Không tìm thấy sách nào phù hợp với "{searchQuery}"
                      </p>
                    </div>
                  </CommandEmpty>
                )}
              </>
            )}

            {!searchQuery && recentSearches.length === 0 && (
              <div className="py-8 text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nhập tên sách, tác giả hoặc thể loại để tìm kiếm
                </p>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchBar;