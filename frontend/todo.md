# Endpoints

get /quotes
get /quotes/:qutee (allow multiple)
get /quotes/:author

get /quote/:id
get /quote/random
put /quote/:id
del /quote/:id

post /quote

post /image
get /image/:key
del /image/:key

get /comments/:quoteId

del /comment/:id
post /comment/

## Todo

- [Quote creator] [] Add drag re-ordering

## User

- [] Adding a highlighted quote
- [] Showing last 3 quotes from this user
- [] Showing how many quotes person added and is quoted on

## Create

- [] Tags front-end input
- [] Tags endpoint (get all tags)
- [] Add anonymous, anonymouseQuotee and option to enalbe / disable comments
- [] Add option

- Add POST & GET for /tags
- Add GET, POST, DEL for comments (just copy from friends)
- Add GET for emotes (just as we had on friends) (optional)
- Add username field to user settings endpoint (no way of getting current user username right now)
- Add 'comments' to a quote struct (boolean), if false, users won't be able to comment on a quote (optional)
- Make tags not required (Right now it gives error which requires you to send at least 1 tag)


<!-- https://quotes.hivecom.net/swagger/ -->