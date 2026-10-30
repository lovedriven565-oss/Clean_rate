# Arc UI source

The button component and motion tokens are adapted from
[kuratlielia/arc-library](https://github.com/kuratlielia/arc-library), licensed
under MIT. The upstream component source is available at commit
`df3a600fd9ffca85ec8607438b599a4408ab8562`.

The button styles use ChistoLab's existing CSS variables and pill-button shape.
Do not import Arc's foundation stylesheet into the app: it defines generic
variables such as `--background` and `--border` that conflict with the existing
design tokens.

Other registered sources:

- [Magic UI](https://github.com/magicuidesign/magicui), MIT
- [shadcn/ui](https://github.com/shadcn-ui/ui), MIT

Only copy individual components after checking their dependencies, license, and
fit with ChistoLab's design tokens. Avoid adding whole upstream repositories to
the runtime bundle.
