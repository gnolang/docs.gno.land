# Exploring gno.land

gno.land can host two types of code: smart contracts, called realms,
and libraries, called pure packages.

 

Realms can contain and manage state, while pure packages are used for creating
reusable functionality, hence they are _pure_.

each realm lives on a package path, similar to a file system.

A typical package path contains the following components:

```
gno.land /   r   /   gnoland   /  home
base       type    namespace     package name
```

realms can have state. the state can be viewed in multiple ways, with
the main one being getting the result of the realm's Render function.

All exposed functions can be evaluated with an ABCI query (link), which is
exactly what gno.land clients, such as `gnoweb`, do.

## `gnoweb`

`gnoweb` is a minimalistic web server that serves as a unified front for all
realms in gno.land.

your entry point to gno.land. the face of gno.land. universal minimalistic frontend
of the gno.land blockchain.

gnoweb - gno.land explorer 

`gnoweb` queries the gno.land chain for the latest state of a specific
realm that the user requests. gno.land's home page is a deployment of `gnoweb`,
querying one of the gno.land networks, the [Portal Loop](link).

examples: gnoland/home, gnoland/blog

The state is typically rendered out in markdown, following minimalistic principles.

gnoweb also provides the source code of each application the user is looking at -transparency
and it also provides a help page, allowing users to quickly call any exposed function on the application.
