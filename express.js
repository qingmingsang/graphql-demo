const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const path = require('path');
const app = express();

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
    type User {
        id: String
        name: String
    }
    input MessageInput {
        content: String
        author: String
    }
    type Message {
        id: ID!
        content: String
        author: String
    }
    type Mutation {
        setSimpleMessage(message: String): String
        createMessage(input: MessageInput): Message
        updateMessage(id: ID!, input: MessageInput): Message
    }
    type RandomDie {
        numSides: Int!
        rollOnce: Int!
        roll(numRolls: Int!): [Int]
    }
    type Query {
        hello: String
        quoteOfTheDay: String
        random: Float!
        rollThreeDice: [Int]
        rollDice(numDice: Int!, numSides: Int): [Int]
        getDie(numSides: Int): RandomDie
        getSimpleMessage: String
        getMessage(id: ID!): Message
        ip: String
        user(id: String): User
    }
`);

//中间件
const loggingMiddleware = (req, res, next) => {
    console.log('ip:', req.ip);
    next();
}

class RandomDie {
    constructor(numSides) {
        this.numSides = numSides;
    }

    rollOnce() {
        return 1 + Math.floor(Math.random() * this.numSides);
    }

    roll({ numRolls }) {
        let output = [];
        for (let i = 0; i < numRolls; i++) {
            output.push(this.rollOnce());
        }
        return output;
    }
}

// If Message had any complex fields, we'd put them on this object.
class Message {
    constructor(id, { content, author }) {
        this.id = id;
        this.content = content;
        this.author = author;
    }
}

let fakeDatabase = {
    'a': {
        id: 'a',
        name: 'alice',
    },
    'b': {
        id: 'b',
        name: 'bob',
    },
};
// The root provides a resolver function for each API endpoint
const root = {
    hello: () => {
        return 'Hello world!';
    },
    quoteOfTheDay: () => {
        return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
    },
    random: () => {
        return Math.random();
    },
    rollThreeDice: () => {
        return [1, 2, 3].map(_ => 1 + Math.floor(Math.random() * 6));
    },
    // rollDice: (args) => {
    //     let output = [];
    //     for (let i = 0; i < args.numDice; i++) {
    //         output.push(1 + Math.floor(Math.random() * (args.numSides || 6)));
    //     }
    //     return output;
    // },
    rollDice: ({ numDice, numSides }) => {
        let output = [];
        for (let i = 0; i < numDice; i++) {
            output.push(1 + Math.floor(Math.random() * (numSides || 6)));
        }
        return output;
    },
    getDie: ({ numSides }) => {
        return new RandomDie(numSides || 6);
    },
    setSimpleMessage: ({ message }) => {
        fakeDatabase.message = message;
        return message;
    },
    getSimpleMessage: () => {
        return fakeDatabase.message;
    },
    getMessage: ({ id }) => {
        if (!fakeDatabase[id]) {
            throw new Error('no message exists with id ' + id);
        }
        return new Message(id, fakeDatabase[id]);
    },
    createMessage: ({ input }) => {
        // Create a random id for our "database".
        let id = require('crypto').randomBytes(10).toString('hex');
        id = '233';
        fakeDatabase[id] = input;
        return new Message(id, input);
    },
    updateMessage: ({ id, input }) => {
        if (!fakeDatabase[id]) {
            throw new Error('no message exists with id ' + id);
        }
        // This replaces all old data, but some apps might want partial update.
        fakeDatabase[id] = input;
        return new Message(id, input);
    },
    ip: function (args, request) {
        return request.ip;
    },
    user: ({ id }) => {
        return fakeDatabase[id];
    }
};

app.use(loggingMiddleware);

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

app.get("/", function (req, res) {
    const p = path.resolve(__dirname, 'index.html');
    res.sendFile(p);
});

const server = app.listen(4000, 'localhost', () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log(`server listening at ${host}:${port}`);
    console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});

/* {
    "errors": [
      {
        "message": "Syntax Error: Unexpected <EOF>",
        "locations": [
          {
            "line": 32,
            "column": 1
          }
        ]
      }
    ]
  } */

