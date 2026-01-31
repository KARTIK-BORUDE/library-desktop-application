/**
 * EXAMPLE: How to use the getTitle function in main.js
 * 
 * This shows how to properly call the service layer from IPC handlers
 */

// At the top of main.js, import the service:
const BookService = require("./Backend/service/bookService.js");

// Create an instance (you can do this once at the top)
const bookService = new BookService();

// Then in your IPC handler:
ipcMain.handle("get-book-title", async (event, accessionNo) => {
    try {
        // Call the service method
        const result = await bookService.getBookTitle(accessionNo);

        // Return the result to the renderer
        return result;

    } catch (error) {
        
        return {
            success: false,
            error: "An unexpected error occurred"
        };
    }
});

/**
 * FRONTEND USAGE (from renderer process):
 * 
 * const result = await window.api.getBookTitle("ACC12345");
 * 
 * if (result.success) {
 *     
 *     
 * } else {
 *     
 * }
 */
