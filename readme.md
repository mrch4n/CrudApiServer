# A simple CRUD Api Server
## How to start:
```
npm install
npm start
```

## Available API end-points:
### GET /api/products
Get all available products
Output:
```
[
    {
        "id": 1,
        "name": "Product",
        "brand": "Kipsta",
        "size": "L",
        "color": "White",
        "availability": [
            {
                "string": "2021-08-31T15:30:44.506+08:00/2021-09-12T05:17:24.506+08:00",
                "start": 1630395044506,
                "end": 1631395044506
            }
        ],
        "createdAt": "2021-08-31T07:31:11.004Z",
        "updatedAt": "2021-08-31T08:09:48.489Z"
    }
]
```

### POST /api/products
Create a product
Input (x-www-form):
```
name: <string>
brand: <string> ('Kipsta', 'Quechua', 'Artengo')
size: <string> ('S', 'M', 'L')
color: <string> ('Blue', 'Green', 'White')
(optional)startDatetime: 1325068800000 (linux timestamp)
(optional)endDatetime: 1327747200000 (linux timestamp)
```

Output:
```
{
    "id": 14,
    "name": "Product01",
    "brand": "Artengo",
    "size": "M",
    "color": "White",
    "availability": "[\"2011-12-28T10:40:00.000Z/2012-01-28T10:40:00.000Z\"]",
    "updatedAt": "2021-08-31T14:04:47.565Z",
    "createdAt": "2021-08-31T14:04:47.565Z"
}
```

### GET /api/products/(id)
Get a product by ID
Output:
```
{
    "id": 1,
    "name": "Product1",
    "brand": "Artengo",
    "size": "L",
    "color": "White",
    "availability": "[\"2011-12-28T10:40:00.000Z/2012-01-28T10:40:00.000Z\"]",
    "createdAt": "2021-08-31T12:29:35.373Z",
    "updatedAt": "2021-08-31T12:29:35.373Z"
}
```

### PUT /api/products/(id)
Update a product by ID
Input (x-www-form):
```
name: <string>
brand: <string> ('Kipsta', 'Quechua', 'Artengo')
size: <string> ('S', 'M', 'L')
color: <string> ('Blue', 'Green', 'White')
(optional)startDatetime: 1325068800000 (linux timestamp)
(optional)endDatetime: 1327747200000 (linux timestamp)
```
Output:
```
{
    "message": "Product was updated successfully."
}
```

### DELETE /api/products/(id)
Delete a product by ID
Output:
```
{
    "message": "Product was deleted successfully."
}
```

### GET /api/availability/(id)
Get all availabilities of a product by product ID
Output:
```
[
    {
        "string": "2011-12-28T18:40:00.000+08:00/2012-01-28T18:40:00.000+08:00",
        "start": 1325068800000,
        "end": 1327747200000
    }
]
```

### PUT /api/availability/(id)
Add a product availability by product ID
Input (x-www-form):
```
startDatetime: 1325068800000 (linux timestamp)
endDatetime: 1327747200000 (linux timestamp)
```

Output:
```
[
    {
        "string": "2011-12-28T18:40:00.000+08:00/2012-01-28T18:40:00.000+08:00",
        "start": 1325068800000,
        "end": 1327747200000
    }
]
```

### GET /api/available/(id)
Check a product availability by product ID
```
{
    "available": true
}
```