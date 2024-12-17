Product Stock and History Service

This project provides a robust solution for managing product stock across multiple stores, along with a detailed history of all stock-related actions. It's built with a microservices architecture, ensuring scalability and maintainability.

## What's Inside?

Product Stock Service: This service handles everything related to product stock. You can:

Create, retrieve, update, and delete stock records.

Easily adjust stock levels (increase/decrease) for both shelf and order quantities.

Find the exact stock information you need with flexible filtering options (by PLU, shop, and quantity).

## History Service: Keeps a meticulous record of all actions performed on products and stock.

You can:

Track every creation, update, and deletion.

Dive into the history with filters for shop, product, action type, and date range.

Navigate through the history with ease using pagination.

## Tech Stack

Language: JavaScript (Node.js) - for efficient and scalable backend development.

Framework: Express.js - a minimalist and flexible framework for building web applications.

Database: PostgreSQL - a powerful and reliable relational database.

Validation: Joi - a robust schema description language and data validator for JavaScript.

Communication: HTTP - for straightforward communication between services (though other methods like message queues could be integrated).

## Getting Started

Clone the repo: git clone https://github.com/EmirJSDev/Product-Stock-Service.git

Install dependencies: npm install

Configure your database: Update the connection details in db.js.

Start the server: node app.js

## Contributing

Feel free to contribute to this project! Whether it's bug fixes, new features, or improving documentation, your contributions are welcome. Just submit a pull request.

## Future Plans

TypeScript Integration: We're considering migrating one of the services to TypeScript for improved type safety.

Enhanced Monitoring: Planning to add robust monitoring to track service health, performance, and errors.

Let's Connect!

Have questions, suggestions, or just want to chat about the project? Don't hesitate to reach out!


## Happy coding!
