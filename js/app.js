// BookSwap PWA Main Application
class BookSwapApp {
  constructor() {
    this.books = this.loadBooks();
    this.currentFilter = 'all';
    this.searchTerm = '';
    this.offlineQueue = this.loadOfflineQueue();
    this.init();
  }

  // Static utility function to safely encode SVG for data URL
  static safeBtoa(str) {
    try {
      // Remove or replace problematic characters
      const cleanStr = str
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/[À-ÿ]/g, '?'); // Replace any remaining accented characters
      
      return btoa(cleanStr);
    } catch (error) {
      console.warn('Failed to encode SVG, using fallback:', error);
      // Fallback: create a simple SVG without special characters
      const fallbackSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
          <rect width="200" height="300" fill="#E2725B"/>
          <rect x="20" y="20" width="160" height="260" fill="white" stroke="#333" stroke-width="2"/>
          <text x="100" y="150" text-anchor="middle" fill="#666" font-family="Arial" font-size="16">Livre</text>
          <text x="100" y="180" text-anchor="middle" fill="#666" font-family="Arial" font-size="12">non disponible</text>
        </svg>
      `;
      return btoa(fallbackSvg);
    }
  }

  // Initialize the application
  init() {
    this.setupEventListeners();
    this.renderBooks();
    this.initializeTheme();
    this.initializeOfflineStorage();
  }

  // Sample books data
  loadBooks() {
    const savedBooks = localStorage.getItem('bookswap-books');
    if (savedBooks) {
      return JSON.parse(savedBooks);
    }

    // Default books
    return [
      {
        id: 1,
        title: "Le Guide du voyageur galactique",
        author: "Douglas Adams",
        status: "read",
        image: `data:image/svg+xml;base64,${BookSwapApp.safeBtoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
  <rect width="200" height="300" fill="#4F46E5"/>
  <rect x="20" y="20" width="160" height="260" fill="white" stroke="#333" stroke-width="2"/>
  <text x="100" y="80" text-anchor="middle" fill="#4F46E5" font-family="Arial" font-size="14" font-weight="bold">LE GUIDE</text>
  <text x="100" y="100" text-anchor="middle" fill="#4F46E5" font-family="Arial" font-size="12">DU VOYAGEUR</text>
  <text x="100" y="120" text-anchor="middle" fill="#4F46E5" font-family="Arial" font-size="12">GALACTIQUE</text>
  <text x="100" y="200" text-anchor="middle" fill="#666" font-family="Arial" font-size="10">Douglas Adams</text>
</svg>
        `)}`,
        dateAdded: new Date().toISOString()
      },
      {
        id: 2,
        title: "Ne tirez pas sur l'oiseau moqueur",
        author: "Harper Lee",
        status: "reading",
        image: `data:image/svg+xml;base64,${BookSwapApp.safeBtoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
  <rect width="200" height="300" fill="#DC2626"/>
  <rect x="20" y="20" width="160" height="260" fill="white" stroke="#333" stroke-width="2"/>
  <text x="100" y="70" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="12" font-weight="bold">NE TIREZ PAS</text>
  <text x="100" y="90" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="12">SUR L'OISEAU</text>
  <text x="100" y="110" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="12">MOQUEUR</text>
  <text x="100" y="200" text-anchor="middle" fill="#666" font-family="Arial" font-size="10">Harper Lee</text>
</svg>
        `)}`,
        dateAdded: new Date().toISOString()
      },
      {
        id: 3,
        title: "1984",
        author: "George Orwell",
        status: "to-read",
        image: `data:image/svg+xml;base64,${BookSwapApp.safeBtoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
  <rect width="200" height="300" fill="#1F2937"/>
  <rect x="20" y="20" width="160" height="260" fill="white" stroke="#333" stroke-width="2"/>
  <text x="100" y="100" text-anchor="middle" fill="#1F2937" font-family="Arial" font-size="24" font-weight="bold">1984</text>
  <text x="100" y="200" text-anchor="middle" fill="#666" font-family="Arial" font-size="10">George Orwell</text>
</svg>
        `)}`,
        dateAdded: new Date().toISOString()
      },
      {
        id: 4,
        title: "Le Seigneur des Anneaux",
        author: "J.R.R. Tolkien",
        status: "read",
        image: `data:image/svg+xml;base64,${BookSwapApp.safeBtoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
  <rect width="200" height="300" fill="#059669"/>
  <rect x="20" y="20" width="160" height="260" fill="white" stroke="#333" stroke-width="2"/>
  <text x="100" y="70" text-anchor="middle" fill="#059669" font-family="Arial" font-size="11" font-weight="bold">LE SEIGNEUR</text>
  <text x="100" y="90" text-anchor="middle" fill="#059669" font-family="Arial" font-size="11">DES</text>
  <text x="100" y="110" text-anchor="middle" fill="#059669" font-family="Arial" font-size="11">ANNEAUX</text>
  <text x="100" y="200" text-anchor="middle" fill="#666" font-family="Arial" font-size="10">J.R.R. Tolkien</text>
</svg>
        `)}`,
        dateAdded: new Date().toISOString()
      },
      {
        id: 5,
        title: "L'Attrape-cœurs",
        author: "J.D. Salinger",
        status: "reading",
        image: `data:image/svg+xml;base64,${BookSwapApp.safeBtoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
  <rect width="200" height="300" fill="#7C3AED"/>
  <rect x="20" y="20" width="160" height="260" fill="white" stroke="#333" stroke-width="2"/>
  <text x="100" y="90" text-anchor="middle" fill="#7C3AED" font-family="Arial" font-size="14" font-weight="bold">L'ATTRAPE-</text>
  <text x="100" y="110" text-anchor="middle" fill="#7C3AED" font-family="Arial" font-size="14">COEURS</text>
  <text x="100" y="200" text-anchor="middle" fill="#666" font-family="Arial" font-size="10">J.D. Salinger</text>
</svg>
        `)}`,
        dateAdded: new Date().toISOString()
      },
      {
        id: 6,
        title: "Orgueil et Préjugés",
        author: "Jane Austen",
        status: "to-read",
        image: `data:image/svg+xml;base64,${BookSwapApp.safeBtoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
  <rect width="200" height="300" fill="#EC4899"/>
  <rect x="20" y="20" width="160" height="260" fill="white" stroke="#333" stroke-width="2"/>
  <text x="100" y="80" text-anchor="middle" fill="#EC4899" font-family="Arial" font-size="12" font-weight="bold">ORGUEIL</text>
  <text x="100" y="100" text-anchor="middle" fill="#EC4899" font-family="Arial" font-size="12">ET</text>
  <text x="100" y="120" text-anchor="middle" fill="#EC4899" font-family="Arial" font-size="12">PREJUGES</text>
  <text x="100" y="200" text-anchor="middle" fill="#666" font-family="Arial" font-size="10">Jane Austen</text>
</svg>
        `)}`,
        dateAdded: new Date().toISOString()
      }
    ];
  }

  // Save books to localStorage
  saveBooks() {
    localStorage.setItem('bookswap-books', JSON.stringify(this.books));
  }

  // Setup event listeners
  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.renderBooks();
    });

    // Filter chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        // Remove active class from all chips
        filterChips.forEach(c => {
          c.classList.remove('active', 'bg-primary', 'text-white');
          c.classList.add('bg-white', 'dark:bg-background-dark');
          const text = c.querySelector('p');
          text.classList.add('text-text-light', 'dark:text-text-dark');
        });

        // Add active class to clicked chip
        chip.classList.add('active', 'bg-primary', 'text-white');
        chip.classList.remove('bg-white', 'dark:bg-background-dark');
        const text = chip.querySelector('p');
        text.classList.remove('text-text-light', 'dark:text-text-dark');

        this.currentFilter = chip.dataset.filter;
        this.renderBooks();
      });
    });

    // Add book buttons
    const addBookFab = document.getElementById('addBookFab');
    const addFirstBook = document.getElementById('addFirstBook');
    
    [addBookFab, addFirstBook].forEach(button => {
      if (button) {
        button.addEventListener('click', () => this.showAddBookDialog());
      }
    });

    // Menu and profile buttons
    const menuButton = document.getElementById('menuButton');
    const profileButton = document.getElementById('profileButton');

    menuButton.addEventListener('click', () => this.showMenu());
    profileButton.addEventListener('click', () => this.showProfile());

    // Theme toggle (could be added to menu)
    document.addEventListener('keydown', (e) => {
      if (e.key === 't' && e.ctrlKey) {
        this.toggleTheme();
      }
    });
  }

  // Render books based on current filter and search
  renderBooks() {
    const booksGrid = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');

    let filteredBooks = this.books;

    // Apply filter
    if (this.currentFilter !== 'all') {
      filteredBooks = filteredBooks.filter(book => book.status === this.currentFilter);
    }

    // Apply search
    if (this.searchTerm) {
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(this.searchTerm) ||
        book.author.toLowerCase().includes(this.searchTerm)
      );
    }

    // Show empty state or books
    if (filteredBooks.length === 0) {
      booksGrid.style.display = 'none';
      emptyState.style.display = 'flex';
      
      const emptyTitle = emptyState.querySelector('h3');
      const emptyText = emptyState.querySelector('p');
      
      if (this.searchTerm) {
        emptyTitle.textContent = 'Aucun résultat trouvé';
        emptyText.textContent = `Aucun livre ne correspond à "${this.searchTerm}"`;
      } else if (this.currentFilter !== 'all') {
        emptyTitle.textContent = 'Aucun livre dans cette catégorie';
        emptyText.textContent = 'Ajoutez des livres ou changez de filtre';
      } else {
        emptyTitle.textContent = 'Votre bibliothèque est vide';
        emptyText.textContent = 'Ajoutez votre premier livre pour commencer!';
      }
    } else {
      booksGrid.style.display = 'grid';
      emptyState.style.display = 'none';
      
      booksGrid.innerHTML = filteredBooks.map(book => this.createBookCard(book)).join('');
      
      // Add click events to book cards
      filteredBooks.forEach(book => {
        const bookCard = document.querySelector(`[data-book-id="${book.id}"]`);
        if (bookCard) {
          bookCard.addEventListener('click', () => this.showBookDetails(book));
        }
      });
    }
  }

  // Create HTML for a book card
  createBookCard(book) {
    const statusColors = {
      'read': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'reading': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'to-read': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };

    const statusLabels = {
      'read': 'Lu',
      'reading': 'En cours',
      'to-read': 'À lire'
    };

    // Use fallback image if offline and external image
    const imageUrl = this.getImageUrl(book.image);

    return `
      <div class="flex flex-col gap-3 pb-3 cursor-pointer hover:transform hover:scale-105 transition-transform duration-200" data-book-id="${book.id}">
        <div class="relative">
          <div class="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl shadow-lg" 
               style="background-image: url('${imageUrl}')"
               data-alt="Couverture du livre ${book.title}">
          </div>
          <div class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[book.status]}">
            ${statusLabels[book.status]}
          </div>
          ${!navigator.onLine && this.isExternalUrl(book.image) ? `
            <div class="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              📡 Hors ligne
            </div>
          ` : ''}
        </div>
        <div>
          <p class="text-text-light dark:text-text-dark text-base font-semibold leading-normal line-clamp-2">${book.title}</p>
          <p class="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">${book.author}</p>
        </div>
      </div>
    `;
  }

  // Get appropriate image URL based on online status
  getImageUrl(originalUrl) {
    if (!navigator.onLine && this.isExternalUrl(originalUrl)) {
      // Return fallback SVG for offline external images
      const fallbackSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
          <rect width="200" height="300" fill="#E2725B"/>
          <rect x="20" y="20" width="160" height="260" fill="white" stroke="#333" stroke-width="2"/>
          <line x1="40" y1="20" x2="40" y2="280" stroke="#ccc" stroke-width="1"/>
          <rect x="45" y="40" width="120" height="30" fill="#E2725B"/>
          <text x="100" y="60" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">LIVRE</text>
          <text x="100" y="140" text-anchor="middle" fill="#666" font-family="Arial" font-size="11">Image non</text>
          <text x="100" y="155" text-anchor="middle" fill="#666" font-family="Arial" font-size="11">disponible</text>
          <text x="100" y="170" text-anchor="middle" fill="#666" font-family="Arial" font-size="11">hors ligne</text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${BookSwapApp.safeBtoa(fallbackSvg)}`;
    }
    return originalUrl;
  }

  // Check if URL is external
  isExternalUrl(url) {
    return url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes(window.location.hostname);
  }

  // Show book details modal
  showBookDetails(book) {
    const modal = this.createModal(`
      <div class="max-w-md w-full bg-white dark:bg-background-dark rounded-lg p-6">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-24 h-32 bg-center bg-no-repeat bg-cover rounded-lg shadow-lg flex-shrink-0" 
               style="background-image: url('${book.image}')">
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-text-light dark:text-text-dark mb-1">${book.title}</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-3">${book.author}</p>
            <select id="statusSelect" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-text-light dark:text-text-dark">
              <option value="to-read" ${book.status === 'to-read' ? 'selected' : ''}>À lire</option>
              <option value="reading" ${book.status === 'reading' ? 'selected' : ''}>En cours</option>
              <option value="read" ${book.status === 'read' ? 'selected' : ''}>Lu</option>
            </select>
          </div>
        </div>
        <div class="flex gap-3">
          <button id="updateBook" class="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-opacity-90">
            Mettre à jour
          </button>
          <button id="deleteBook" class="px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900">
            Supprimer
          </button>
          <button id="closeModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-text-light dark:text-text-dark rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
            Fermer
          </button>
        </div>
      </div>
    `);

    // Event listeners for modal buttons
    modal.querySelector('#updateBook').addEventListener('click', () => {
      const newStatus = modal.querySelector('#statusSelect').value;
      this.updateBookStatus(book.id, newStatus);
      document.body.removeChild(modal);
    });

    modal.querySelector('#deleteBook').addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
        this.deleteBook(book.id);
        document.body.removeChild(modal);
      }
    });

    modal.querySelector('#closeModal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }

  // Show add book dialog
  showAddBookDialog() {
    const modal = this.createModal(`
      <div class="max-w-md w-full bg-white dark:bg-background-dark rounded-lg p-6">
        <h3 class="text-xl font-bold text-text-light dark:text-text-dark mb-4">Ajouter un livre</h3>
        <form id="addBookForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Titre</label>
            <input type="text" id="bookTitle" required class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-text-light dark:text-text-dark">
          </div>
          <div>
            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Auteur</label>
            <input type="text" id="bookAuthor" required class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-text-light dark:text-text-dark">
          </div>
          <div>
            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Statut</label>
            <select id="bookStatus" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-text-light dark:text-text-dark">
              <option value="to-read">À lire</option>
              <option value="reading">En cours</option>
              <option value="read">Lu</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">URL de l'image (optionnel)</label>
            <input type="url" id="bookImage" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-text-light dark:text-text-dark">
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-opacity-90">
              Ajouter
            </button>
            <button type="button" id="cancelAdd" class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-text-light dark:text-text-dark rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
              Annuler
            </button>
          </div>
        </form>
      </div>
    `);

    modal.querySelector('#addBookForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = modal.querySelector('#bookTitle').value;
      const author = modal.querySelector('#bookAuthor').value;
      const status = modal.querySelector('#bookStatus').value;
      // Générer une image SVG par défaut si pas d'URL fournie
      const defaultImage = 'data:image/svg+xml;base64,' + BookSwapApp.safeBtoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
  <rect width="200" height="300" fill="#E2725B"/>
  <rect x="20" y="20" width="160" height="260" fill="white" stroke="#333" stroke-width="2"/>
  <text x="100" y="150" text-anchor="middle" fill="#666" font-family="Arial" font-size="16">Pas d'image</text>
  <text x="100" y="180" text-anchor="middle" fill="#666" font-family="Arial" font-size="14">disponible</text>
</svg>
      `);
      const image = modal.querySelector('#bookImage').value || defaultImage;

      this.addBook({ title, author, status, image });
      document.body.removeChild(modal);
    });

    modal.querySelector('#cancelAdd').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }

  // Create modal overlay
  createModal(content) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = content;
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    document.body.appendChild(modal);
    return modal;
  }

  // Add new book
  addBook(bookData) {
    const newBook = {
      id: Date.now(),
      ...bookData,
      dateAdded: new Date().toISOString()
    };

    this.books.unshift(newBook);
    this.saveBooks();
    this.renderBooks();
    this.showToast('Livre ajouté avec succès!');
  }

  // Update book status
  updateBookStatus(bookId, newStatus) {
    const book = this.books.find(b => b.id === bookId);
    if (book) {
      book.status = newStatus;
      this.saveBooks();
      this.renderBooks();
      this.showToast('Statut mis à jour!');
    }
  }

  // Delete book
  deleteBook(bookId) {
    this.books = this.books.filter(b => b.id !== bookId);
    this.saveBooks();
    this.renderBooks();
    this.showToast('Livre supprimé!');
  }

  // Show toast notification
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-text-light dark:bg-text-dark text-white dark:text-text-light px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2000);
  }

  // Show menu
  showMenu() {
    const modal = this.createModal(`
      <div class="max-w-sm w-full bg-white dark:bg-background-dark rounded-lg p-6">
        <h3 class="text-xl font-bold text-text-light dark:text-text-dark mb-4">Menu</h3>
        <div class="space-y-3">
          <button id="toggleTheme" class="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <path d="M11.01 3.05C6.51 3.54 3 7.36 3 12c0 4.97 4.03 9 9 9 4.63 0 8.45-3.5 8.95-8 .09-.79-.78-1.42-1.54-.95-.84.54-1.84.95-2.91.95-2.98 0-5.4-2.42-5.4-5.4 0-1.06.41-2.06.95-2.91.47-.76-.16-1.63-.95-1.54z"/>
            </svg>
            <span class="text-text-light dark:text-text-dark">Changer de thème</span>
          </button>
          <button id="exportData" class="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            <span class="text-text-light dark:text-text-dark">Exporter les données</span>
          </button>
          <button id="importData" class="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
            </svg>
            <span class="text-text-light dark:text-text-dark">Importer les données</span>
          </button>
          <button id="clearData" class="w-full text-left p-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 flex items-center gap-3">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            <span>Effacer toutes les données</span>
          </button>
        </div>
        <button id="closeMenu" class="w-full mt-4 py-2 px-4 border border-gray-300 dark:border-gray-600 text-text-light dark:text-text-dark rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
          Fermer
        </button>
      </div>
    `);

    // Menu event listeners
    modal.querySelector('#toggleTheme').addEventListener('click', () => {
      this.toggleTheme();
      document.body.removeChild(modal);
    });

    modal.querySelector('#exportData').addEventListener('click', () => {
      this.exportData();
      document.body.removeChild(modal);
    });

    modal.querySelector('#importData').addEventListener('click', () => {
      this.importData();
      document.body.removeChild(modal);
    });

    modal.querySelector('#clearData').addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir effacer toutes vos données ? Cette action est irréversible.')) {
        localStorage.clear();
        this.books = [];
        this.renderBooks();
        this.showToast('Données effacées!');
      }
      document.body.removeChild(modal);
    });

    modal.querySelector('#closeMenu').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }

  // Show profile
  showProfile() {
    this.showToast('Profil - Fonctionnalité à venir!');
  }

  // Initialize theme
  initializeTheme() {
    const savedTheme = localStorage.getItem('bookswap-theme');
    if (savedTheme) {
      document.documentElement.className = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.className = 'dark';
    }
  }

  // Toggle theme
  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.className = newTheme;
    localStorage.setItem('bookswap-theme', newTheme);
    this.showToast(`Thème ${newTheme === 'dark' ? 'sombre' : 'clair'} activé!`);
  }

  // Export data
  exportData() {
    const data = {
      books: this.books,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookswap-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Données exportées!');
  }

  // Import data
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.books && Array.isArray(data.books)) {
              this.books = data.books;
              this.saveBooks();
              this.renderBooks();
              this.showToast('Données importées avec succès!');
            } else {
              throw new Error('Format de fichier invalide');
            }
          } catch (error) {
            this.showToast('Erreur lors de l\'importation!');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }

  // Initialize offline storage
  initializeOfflineStorage() {
    // This would typically involve setting up IndexedDB for more complex offline storage
    // For now, we're using localStorage which is simpler but more limited
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.showToast('Connexion rétablie!');
      // Test server connectivity
      this.testServerConnectivity();
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.showToast('Mode hors ligne activé');
      this.updateOfflineUI();
    });

    // Initial check
    this.updateOfflineUI();
    
    // Periodic server health check if online
    this.startServerHealthCheck();
  }

  // Test if server is reachable (even if navigator.onLine is true)
  async testServerConnectivity() {
    if (!navigator.onLine) return false;

    try {
      // Test connectivité avec l'index.html plutôt que la racine
      const response = await fetch('./index.html', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      if (response.ok) {
        this.handleServerOnline();
        return true;
      } else {
        this.handleServerOffline();
        return false;
      }
    } catch (error) {
      console.log('Server connectivity test failed:', error);
      this.handleServerOffline();
      return false;
    }
  }

  // Handle server back online
  handleServerOnline() {
    const indicator = document.getElementById('offlineIndicator');
    if (indicator.classList.contains('show')) {
      indicator.classList.remove('show');
      this.showToast('Serveur de nouveau accessible!');
    }
    this.syncData();
  }

  // Handle server offline (but network may be online)
  handleServerOffline() {
    const indicator = document.getElementById('offlineIndicator');
    const title = indicator.querySelector('.offline-title');
    const details = indicator.querySelector('.offline-details small');
    
    if (navigator.onLine) {
      // Network is online but server is down
      title.textContent = 'Serveur indisponible';
      details.textContent = 'Connexion OK, mais serveur inaccessible. Mode cache activé.';
    } else {
      // Completely offline
      title.textContent = 'Mode hors ligne';
      details.textContent = 'Fonctions limitées : pas de sync, images externes indisponibles';
    }
    
    indicator.classList.add('show');
  }

  // Start periodic server health check
  startServerHealthCheck() {
    // Check every 30 seconds if online
    setInterval(() => {
      if (navigator.onLine) {
        this.testServerConnectivity();
      }
    }, 30000);
  }

  // Update UI based on offline status
  updateOfflineUI() {
    const offlineElements = document.querySelectorAll('.offline-only');
    const onlineElements = document.querySelectorAll('.online-only');
    
    if (navigator.onLine) {
      offlineElements.forEach(el => el.style.display = 'none');
      onlineElements.forEach(el => el.style.display = 'block');
    } else {
      offlineElements.forEach(el => el.style.display = 'block');
      onlineElements.forEach(el => el.style.display = 'none');
      
      // Re-render books to show offline indicators
      this.renderBooks();
    }
  }

  // Load offline queue
  loadOfflineQueue() {
    const queue = localStorage.getItem('bookswap-offline-queue');
    return queue ? JSON.parse(queue) : [];
  }

  // Save offline queue
  saveOfflineQueue() {
    localStorage.setItem('bookswap-offline-queue', JSON.stringify(this.offlineQueue));
  }

  // Add action to offline queue
  addToOfflineQueue(action) {
    if (!navigator.onLine) {
      this.offlineQueue.push({
        ...action,
        timestamp: Date.now()
      });
      this.saveOfflineQueue();
      this.showToast(`Action mise en queue (${this.offlineQueue.length} en attente)`);
    }
  }

  // Process offline queue when back online
  processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    const totalActions = this.offlineQueue.length;
    let processedActions = 0;

    this.offlineQueue.forEach(action => {
      // Process each queued action
      this.processQueuedAction(action)
        .then(() => {
          processedActions++;
          if (processedActions === totalActions) {
            this.offlineQueue = [];
            this.saveOfflineQueue();
            this.showToast(`${totalActions} actions synchronisées!`);
          }
        })
        .catch(error => {
          console.error('Error processing queued action:', error);
        });
    });
  }

  // Process individual queued action
  async processQueuedAction(action) {
    // This would typically sync with a server
    // For now, just simulate the process
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Processed offline action:', action);
        resolve();
      }, 100);
    });
  }

  // Sync data (placeholder for future server integration)
  syncData() {
    // This would sync with a backend server in a real application
    console.log('Syncing data...');
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.bookswapApp = new BookSwapApp();
});

// Handle app installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// Utility functions for PWA features
const PWAUtils = {
  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  // Show notification
  showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
    }
  },

  // Check if app is running as PWA
  isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }
};

// Export for global access
window.PWAUtils = PWAUtils;