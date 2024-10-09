class Book {
    id: number;
    name: string;
    author: string;
    price: number;
    description: string;
    amountInStock: number;

    constructor(id: number, name: string, author: string, price: number, description: string, amountInStock: number) {
        this.id = id;
        this.name = name;
        this.author = author;
        this.price = price;
        this.description = description;
        this.amountInStock = amountInStock;
    }
}

export default Book;
