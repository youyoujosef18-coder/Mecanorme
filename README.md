# MECANORME — Site web

Site vitrine immersif : Next.js 14 (App Router) · TypeScript · Tailwind · React Three Fiber · Framer Motion.
Français par défaut, bascule anglaise.

## Démarrer

```bash
npm install
npm run dev          # http://localhost:3000
```

## Déployer un aperçu sur Vercel

```bash
npx vercel           # première fois : lie le projet, puis renvoie une URL de préversion
npx vercel --prod    # quand vous êtes prêt à publier
```

## Structure

```
src/
  app/                     layout, page, metadata SEO, sitemap, robots
  components/
    brand/Logo.tsx         logotype MECANORME reconstruit en SVG vectoriel
    layout/                navigation, loader, pied de page
    sections/              héros, intro, explorateur de métiers, récit, méthode,
                           interventions, engagements, contact
    three/
      SceneShell.tsx       caméra, éclairage, environnement, ombres de contact
      LazyScene.tsx        montage à l'approche du viewport + repli si WebGL absent
      materials.ts         matériaux industriels (acier, inox, galva, tôle, laine)
      parts/               tuyauterie, vannes, pompes, ballons, gaines, ventilateurs,
                           sprinklers, manomètres, engrenages, particules de flux, étiquettes
      scenes/              une scène par métier + la machine du héros
    fallbacks/             schémas P&ID animés (repli 2D)
  lib/
    i18n/dict.ts           tout le contenu FR + EN
    data/services.ts       métiers, accents, valeurs simulées
    hooks.ts               mobile, pointeur, reduced-motion, support WebGL
```

## Points d'entrée pour modifier le contenu

| Ce que vous voulez changer | Fichier |
|---|---|
| Textes, titres, descriptions (FR et EN) | `src/lib/i18n/dict.ts` |
| Coordonnées | `src/lib/i18n/dict.ts` → `contact` |
| Métiers affichés, ordre, couleurs d'accent | `src/lib/data/services.ts` |
| Valeurs affichées dans « État système » | `src/lib/data/services.ts` → `sims` |
| Géométrie d'une démonstration 3D | `src/components/three/scenes/*.tsx` |

## Notes

- Les valeurs de l'encart « État système » sont une **simulation visuelle**, signalée comme telle sous le panneau. Elles ne prétendent pas venir d'un site réel.
- « Ce que nous réalisons » présente **une réalisation par métier (six cartes)**, chacune avec sa scène 3D en direct plutôt qu'une photo. Chaque carte porte l'identifiant de son métier dans `src/lib/i18n/dict.ts` → `projects.items[].id` : l'ordre et les textes se changent là, le cadrage 3D (caméra, état affiché) dans `SHOTS` de `src/components/sections/Projects.tsx`. Pour passer à de vraies photos de chantier, remplacez le bloc `LazyScene` de ce fichier.
- Sur écran tactile, les vignettes 3D ne capturent jamais le doigt (le défilement reste libre) ; dans l'explorateur, la rotation s'active avec le bouton « Pivoter la vue ».
- Le formulaire de contact ouvre la messagerie du visiteur (`mailto:`) avec la demande pré-remplie. Pour un vrai backend, remplacez `onSubmit` dans `src/components/sections/Contact.tsx`.
