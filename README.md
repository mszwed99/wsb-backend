# Tworzenie backendu do aplikacji webowych - API

## Autoryzacja

- **Rejestracja**

> Tworzy użytkownika w bazie danych i zwraca tokeny (odświeżający i dostępu)

    POST http://localhost:3000/api/auth/signup
    {
      email: "user@test.pl",
      password: "qwerty123",
      name: "Jan",
      surname: "Kowalski"
    }
------------
- **Logowanie**

> Zwraca tokeny dostępu i odświeżający

    POST http://localhost:3000/api/auth/signin
    {
      email: "user@test.pl",
      password: "qwerty123",
    }
------------
- **Odświeżanie**

> Tworzy nowy token odświeżający dla użytkownika i aktualizuje zhashowany token w bazie danych
> Wymaga tokena odświeżającego w nagłówkach

    POST http://localhost:3000/api/auth/refresh
------------
- **Wylogowanie**

> Wyloguj użytkownika i usuń token odświeżający z bazy danych
> Wymaga tokena dostępu w nagłówkach

    POST http://localhost:3000/api/auth/logout
------------
## Użytkownicy
------------
- **Pobierz wszystkich użytkowników**

> Zwraca listę użytkowników z opcjonalnymi powiązaniami
> Opcje paginacji: ?addresses=true&roles=true&shops=true&orders=true&take=3&skip=2
> Wymagana rola administratora

    GET http://localhost:3000/api/users?addresses=true&roles=true&take=3&skip=2
------------
- **Pobierz informacje o obecnie zalogowanym użytkowniku**

> Zwraca informacje o obecnie zalogowanym użytkowniku

    GET  http://localhost:3000/api/users/info
------------
- **Pobierz sklepy użytkownika**

> Zwraca sklepy obecnie zalogowanego użytkownika

    GET  http://localhost:3000/api/users/shops
------------
## Adresy
- **Pobierz adresy użytkownika**

> Zwraca adresy obecnie zalogowanego użytkownika

    GET  http://localhost:3000/api/addresses
------------
- **Dodaj adres**

> Dodaj nowy adres dla użytkownika

    POST http://localhost:3000/api/users/address
    {
      label: "Dom",
      city: "Sopot",
      postCode: "78-100",
      street: "Kołobrzeska 18/16",
      phoneNumber: "997997997"
    }
------------
- **Usuń adres**

> Usuń adres użytkownika

    DELETE http://localhost:3000/api/users/address/{id}
------------
## Kategorie
- **Znajdź wszystkie**

> Zwraca wszystkie kategorie

    GET http://localhost:3000/api/categories
------------
- **Dodaj kategorię**

> Dodaj nową kategorię

    POST http://localhost:3000/api/categories
    {
      name: "Owoce",
    }
------------
- **Usuń kategorię**

> Usuń kategorię

    DELETE http://localhost:3000/api/categories/{id}
------------
- **Zmień nazwę kategorii**

> Zmień nazwę kategorii

    PATCH http://localhost:3000/api/categories/{id}
    {
      name: "Nowa nazwa",
    }
------------
## Sklepy
------------
- **Utwórz sklep**

> Tworzy nowy sklep

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
- **Usuń sklep**

> Usuń sklep

    DELETE http://localhost:3000/api/shops/{id}
------------
- **Pobierz wszystkie sklepy**

> Zwraca listę sklepów z opcjonalnymi powiązaniami
> Opcje paginacji: ?addresses=true&user=true&products=true&take=3&skip=2

    GET http://localhost:3000/api/shops?addresses=true&user=true&products=true&take=3&skip=2
------------
- **Pobierz informacje o sklepie**

> Zwraca informacje o sklepie

    GET http://localhost:3000/api/shops/{shopID}

- **Znajdź aktywne sklepy**

> Zwraca listę aktywnych sklepów
> Opcje paginacji: ?addresses=true&user=true&products=true&take=3&skip=2

    GET http://localhost:3000/api/shops/active


------------

- **Znajdź nieaktywne sklepy**

> Zwraca listę nieaktywnych sklepów
> Opcje paginacji: ?addresses=true&user=true&products=true&take=3&skip=2

    GET http://localhost:3000/api/shops/inactive


- **Zmień status sklepu**

> Zmień status sklepu na 0/1
> Wymagana rola administratora

    GET http://localhost:3000/api/shops/status/{id}

## Produkty
- **Dodaj produkt**

> Dodaj nowy produkt do sklepu
> Użytkownik musi być właścicielem sklepu

    POST http://localhost:3000/api/products/shop/{shopID}
    {
      name: "Skarpetki" ,
      amount: 3,
      description: "Idealne do gry w kosza",
      vat: 23,
      price: 120,
      categories: [
          "4b6f8032-abe9-428e-8c99-328a8b825b2b",
          "1C6f8032-Ube2-628e-4f99-1235f12f14f23",
      ]
    }

- **Ustaw obraz produktu**

> Wgraj obraz produktu
> Ustaw adres URL obrazu dla produktu

    POST http://localhost:3000/api/products/image/{productId}
    file('image')

- **Edytuj produkt w sklepie**

> Edytuj produkt w sklepie
> Użytkownik musi być właścicielem sklepu

    PATCH http://localhost:3000/api/products/{shopId/{productId}
    {
      name: "nowa nazwa" ,
      amount: 10000,
      description: "nowy opis",
      vat: 23,
      price: 110000
    }

- **Znajdź jeden produkt**

> Zwraca jeden produkt

    GET http://localhost:3000/api/products/find/{productId}



- **Znajdź wszystkie produkty**

> Znajdź wszystkie produkty
> Opcje paginacji: ?categoryID={categoryID}&categoryID={categoryID}&max={number}&min={number}&name={name}&take=3&skip=2

    GET http://localhost:3000/api/products/find?name=test&max=30000&min=10000&categoryID={id}&categoryID={id}&skip=0&take=1

- **Znajdź wszystkie produkty w sklepie**

> Znajdź wszystkie produkty w sklepie
> Opcje paginacji: ?categoryID={categoryID}&categoryID={categoryID}&max={number}&min={number}&name={name}&take=3&skip=2

    GET http://localhost:3000/api/products/find/shop/{shopId}?name=test&max=30000&min=10000&categoryID={id}&categoryID={id}&skip=0&take=1

- **Znajdź produkty według Ids**

> Znajdź wszystkie produkty o podanych Ids

    GET http://localhost:3000/api/products/check?productId={productId}productId={productId}

- **Sprawdź, czy podana ilość produktu jest dostępna**

> Zwraca true lub false

    GET http://localhost:3000/api/products/{productId}/{amount}
    
## Zamówienia
- **Utwórz nowe zamówienie**

> Tworzy nowe zamówienie

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

- **Znajdź zamówienia użytkownika**

> Zwraca wszystkie zamówienia użytkownika

    GET http://localhost:3000/api/orders

- **Znajdź zamówienia sklepu**

> Zwraca wszystkie zamówienia sklepu

    GET http://localhost:3000/api/orders/shop/{shopId}

- **Anuluj zamówienie**

> Anuluj zamówienie 
> Tylko zamówienia ze statusem 'pending' mogą być anulowane

    POST http://localhost:3000/api/orders/cancel/{orderId}

- **Płatność za zamówienie**

> Płatność za zamówienie
> Tylko zamówienia ze statusem 'pending' mogą być opłacone

    POST http://localhost:3000/api/orders/payment/{orderId}

- **Zakończ zamówienie (strona sklepu)**

> Ustawia status sklepu na true (gdy wszystkie sklepy powiązane z zamówieniem są true, status zamówienia zmienia się na 'complete')

    POST http://localhost:3000/api/orders/complete/{shopId}/{orderId}
