const { Book } = require("../models/Books/bookModel.js");

class BookService {
    constructor() {
        this.bookModel = new Book();
    }

    /**
     * Get book title and availability by accession number
     * @param {string} accessionNo - The accession number of the book
     * @returns {Promise<Object>} Response object with success status and data/error
     */
    async getBookTitle(accessionNo) {
        try {
            // Validate input
            if (!accessionNo) {
                return {
                    success: false,
                    error: "Accession number is required"
                };
            }

            // Call model to fetch data
            const result = await this.bookModel.getTitle(accessionNo);

            // Return the result from model
            return result;

        } catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to fetch book title"
            };
        }
    }

    async getTotalBooks() {
        try {
            return await this.bookModel.getTotalBooks();
        }
        catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to fetch data"
            }

        }
    }

    async AddBook(data) {
        try {
            
            return await this.bookModel.AddBook(data);
        } catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to Add Book"

            }
        }

    }
    async seeTotalBooks() {
        try {
            return await this.bookModel.seeTotalBooks();
        }
        catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to fetch data"
            }

        }
    }

    async exportBooks() {
        try {
            return await this.bookModel.exportBooks();
        }
        catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to fetch data"
            }

        }
    }
    async searchBooks(term) {
        try {
            return await this.bookModel.searchBooks(term);
        }
        catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to fetch data"
            }

        }
    }

    async updateBook(book) {
        if (!book) {
            return {
                success: false,
                error: "Book Not Found"
            }
        }
        try {
            return await this.bookModel.updateBook(book);
        } catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to fetch data"
            }
        }
    }

    async issueBook(issue_book) {
        try {
            return await this.bookModel.issueBook(issue_book);
        }
        catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to fetch data"
            }
        }
    }

    async getIssuedBooks(data) {
        try {
            return await this.bookModel.getIssuedBooks();
        }
        catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to fetch data"
            }
        }
    }
    async getDataOfIssuedBooks(data) {
        if (!data) {
            return {
                success: false,
                error: "Data Not Found"
            }
        }
        try {
            return await this.bookModel.getDataOfIssuedBooks(data);
        }
        catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to fetch data"
            }
        }
    }
    async fileReturnBook(data) {
        try {
            if (!data) {
                return {
                    success: false,
                    error: "Data Not Found"
                }
            }
            return await this.bookModel.fileReturnBook(data);
        }
        catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to fetch data"
            }
        }
    }

    async isBookExists(acc_no) {
        try {
            return await this.bookModel.isBookExists(acc_no);
        }
        catch (error) {
            
            return {
                success: false,
                error: error.message || "Failed to fetch data"
            }
        }
    }
}

module.exports = BookService;
