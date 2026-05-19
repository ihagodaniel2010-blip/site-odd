# Welcome to your Lovable project

TODO: Document your project here

## Deploy Automatico (GitHub -> Vercel)

Sempre que uma alteracao for aprovada, use este fluxo:

```bash
git checkout main
git pull origin main
npm run build
git add .
git commit -m "..."
git push origin main
```

Com o projeto conectado ao GitHub e Production Branch configurada como `main` na Vercel, cada push em `main` dispara deploy automatico.
