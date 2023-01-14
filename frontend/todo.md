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

- [Quote preview] [] Properly test all ways a quote can exist
- [Quote creator] [] Add drag re-ordering