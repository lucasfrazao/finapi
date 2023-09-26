const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const costumers = [];

// Middleware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = costumers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found!" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amout;
    } else {
      return acc - operation.amout;
    }
  }, 0);

  return balance;
}

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = costumers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: "Customer already exists!" });
  }

  costumers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return response.status(201).send();
});

app.get("/statement/", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return retorne.status(400).json({
      error: "Insufficinte founds!",
    });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.listen(3333);
