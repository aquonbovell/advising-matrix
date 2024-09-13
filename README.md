# advising-matrix

Everything you need to build this Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Developing

Once you've created/cloned this project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of this app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Database

### Migrations

To migrate the database use the following command:

```bash
npx prisma migrate dev --name init
```

This generates the database depending on what the variable `DATABASE_URL` is set to in the `.env` file.

### Seeding the Database

To seed the database use the following command:

```bash
npx prisma db seed
```

This will seed the database with 3 default users for demo scenarios
