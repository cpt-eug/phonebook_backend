const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())

let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

// Using a custom format function
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      req.method === 'POST' ? JSON.stringify(req.body) : ''
    ].join(' ')
}))

app.use(express.json())

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

app.get('/info', (request, response) => {
    const currentDate = new Date().toString()
    const personCount = persons.length
    response.send(
    `<div>
        <p>Phonebook has info for ${personCount} people</p>
        <p>${currentDate}</p>
    </div>`)
})

const generateRandomId = (max) => {
    const id = Math.floor(Math.random() * max)

    if (persons.filter(person => person.id === id).length > 0) {
        generateRandomId()
    } else {
        console.log(id)
        return id
    }
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.number || !body.name) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    if (persons.filter(person => person.name.toLowerCase() === body.name.toLowerCase()).length > 0){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateRandomId(1000),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(person)
    response.json(persons)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(note => note.id !== id)
  
    response.status(204).end()
})

// if routes cant be found
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: "unknown endpoint"})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})