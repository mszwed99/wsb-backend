
#  Online Trading Platform - API

## Authorization

- **Sign Up**

> Creates a user in the database and returns tokens ( refresh and access )

    POST http://localhost:3000/api/auth/signup
    {
	  email: "user@test.pl",
	  password: "qwerty123",
	  name: "Jan",
	  surname: "Kowalski"
	}
------------
- **Sign In**

> Returns access and refresh tokens

	POST http://localhost:3000/api/auth/signin
    {
	  email: "user@test.pl",
	  password: "qwerty123",
	}
------------
- **Refresh**

> Creates a new refresh token for user and updates hashed token in the database
> Requires refersh token in headers

	POST http://localhost:3000/api/auth/refresh
------------
- **Log out**

> Log out a user and delete refresh token from the database
> Requires access token in  headers

	POST http://localhost:3000/api/auth/logout
------------
## Users
------------
- **Get all users**

> Returns users list with optional relations
> Pagination options: ?addresses=true&roles=true&shops=true&orders=true&take=3&skip=2
> Admin role is required

	GET http://localhost:3000/api/users?addresses=true&roles=true&take=3&skip=2
------------
- **Get currently logged in user info**

> Returns currently logged in user information

	GET  http://localhost:3000/api/users/info
------------
- **Get user shops**

> Returns currently logged in user shops

	GET  http://localhost:3000/api/users/shops
------------
## Addresses
- **Get user addresses**

> Returns currently logged in user addresses

	GET  http://localhost:3000/api/addresses
------------
- **Add address**

> Add new address to user

	POST http://localhost:3000/api/users/address
	{
	  label: "Dom",
	  city: "Sopot",
	  postCode: "78-100",
	  street: "Kołobrzeska 18/16",
	  phoneNumber: "997997997"
	}
------------
- **Remove address**

> Remove address from user

	DELETE http://localhost:3000/api/users/address/{id}
------------
## Categories
- **Find all**

> Returns all categories

	GET http://localhost:3000/api/categories
------------
- **Add category**

> Add new category

	POST http://localhost:3000/api/categories
	{
	  name: "Owoce",
	}
------------
- **Remove category**

> Remove category

	DELETE http://localhost:3000/api/categories/{id}
------------
- **Rename category**

> Rename category

	PATCH http://localhost:3000/api/categories/{id}
	{
	  name: "Nowa nazwa",
	}
------------
## Shops
------------
- **Create shop**

> Creates new shop

	POST http://localhost:3000/api/shops
	{
		name: "Zioła świata",
		bio: "Sklep zielarski",
		nip: "7347433717",
		city: "Słupsk",
		postCode: "78-100",
		street: "Kamyczkowa 7/8",
		phoneNumber: "383710634",
		bankAccount: "49147010543176579163507404"
	}
------------
- **Remove shop**

> Remove shop

	DELETE http://localhost:3000/api/shops/{id}
------------
- **Get all shops**

> Returns shop list with optional relations
> Pagination options: ?addresses=true&user=true&products=true&take=3&skip=2

	GET http://localhost:3000/api/shops?addresses=true&user=true&products=true&take=3&skip=2
------------
- **Get shop info**

> Returns shop info

	GET http://localhost:3000/api/shops/{shopID}

- **Find active shops**

> Returns active shops list
> Pagination options: ?addresses=true&user=true&products=true&take=3&skip=2

	GET http://localhost:3000/api/shops/active


------------

- **Find inactive shops**

> Returns inactive shops list
> Pagination options: ?addresses=true&user=true&products=true&take=3&skip=2

	GET http://localhost:3000/api/shops/inactive


- **Change shop status**

> Change shop status 0/1
> Admin role is required

	GET http://localhost:3000/api/shops/status/{id}

## Products
- **Add product**

> Add new product to shop
> User must be shop owner

	POST http://localhost:3000/api/products/shop/{shopID}
	{
		name: "Skarpetki" ,
		amount: 3,
		description: "idelne do gry w kosza",
		vat: 23,
		price: 120,
		categories: [
				"4b6f8032-abe9-428e-8c99-328a8b825b2b",
				"1C6f8032-Ube2-628e-4f99-1235f12f14f23",
		]
	}

- **Set product image**

> Uploads product image
> Set image url for product

	POST http://localhost:3000/api/products/image/{productId}
	file('image')

- **Remove product**

> Remove product from shop
> User must be shop owner

	DELETE http://localhost:3000/api/products/shops/{shopId}/{productId}


- **Edit product in shop**

> Edit product in shop
> User have to be a shop owner to edit product

	PATCH http://localhost:3000/api/products/{shopId/{productId}
	{
		{
		name: "nowa nazwa" ,
		amount: 10000,
		description: "nowy opis",
		vat: 23,
		price: 110000
	}

- **Find one product**

> Returns one product

	GET http://localhost:3000/api/products/find/{productId}



- **Find all products**

> Find all products
> Pagination options: ?categoryID={categoryID}&categoryID={categoryID}&max={number}&min={number}&name={name}&take=3&skip=2

	GET http://localhost:3000/api/products/find?name=test&max=30000&min=10000&categoryID={id}&categoryID={id}&skip=0&take=1

- **Find all products in shop**

> Find all products in shop
> Pagination options: ?categoryID={categoryID}&categoryID={categoryID}&max={number}&min={number}&name={name}&take=3&skip=2

	GET http://localhost:3000/api/products/find/shop/{shopId}?name=test&max=30000&min=10000&categoryID={id}&categoryID={id}&skip=0&take=1

- **Find by product Ids**

> Find all products with given Ids

	GET http://localhost:3000/api/products/check?productId={productId}productId={productId}

- **Check if given amount is avaible for product**

> Returns true or false

	GET http://localhost:3000/api/products/{productId}/{amount}
	
## Orders
- **Create new order**

> Creates new order

	POST http://localhost:3000/api/orders
	{   "nip": "1347433713",
    "addressId": "b35f7016-6f79-4a45-bed0-0453549d3b49",
    "items": [
        {
           "productId": "ad140ea0-f42f-4450-8655-a167fd349c87",
           "amount": 3
        },
        {
           "productId": "6d482fd3-55ff-4e1f-90da-b6c95b98c30d",
           "amount": 1
        },
        {
           "productId": "26418a24-b152-466e-8db9-44f8390d769d",
           "amount": 1
        },
        {
           "productId": "1f1cff8e-c48b-43b8-8b9c-5cc932d415e3",
           "amount": 1
        }
     ]
	}

- **Find user orders**

> Returns all user orders

	GET http://localhost:3000/api/orders

- **Find shop orders**

> Returns all shop orders

	GET http://localhost:3000/api/orders/shop/{shopId}

- **Order cancel**

> Cancel order 
> Only orders with status 'pending' can be canceled

	POST http://localhost:3000/api/orders/cancel/{orderId}

- **Order payment**

> Order payment
> Only orders with status 'pending' can be paid

	POST http://localhost:3000/api/orders/payment/{orderId}

- **Complete order ( Shop side )**

> Set shopStatus to true ( when all shops related with order are true, then order status changes to complete)

	POST http://localhost:3000/api/orders/complete/{shopId}/{orderId}

