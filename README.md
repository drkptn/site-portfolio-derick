# Derick Putini — Portfolio

Portfólio pessoal de **Derick Putini**, estudante de Ciência da Computação (UNINTER) com foco em desenvolvimento de software, Front-End, análise de dados e UI/UX.

One-page, dark/minimal, bilíngue (EN/PT), com cena 3D em tempo real, cursor customizado, scroll suave e animações coreografadas.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Base | React 19 · TypeScript · Vite |
| Estilo | Tailwind CSS v4 (tokens monocromáticos em `src/styles/globals.css`) |
| Animação | Motion (`motion/react`) · Lenis (smooth scroll) |
| 3D | Three.js + React Three Fiber (carregado sob demanda) |
| Ícones / fontes | Lucide · Geist + Geist Mono (self-hosted via Fontsource) |

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de produção em dist/
npm run preview    # serve o build
```

## Configuração (`.env`)

Copie `.env.example` para `.env`:

| Variável | Para quê |
| --- | --- |
| `VITE_SITE_URL` | Domínio final (ex.: `https://seudominio.com`). Gera canonical, Open Graph absoluto, `sitemap.xml` e linha `Sitemap:` no `robots.txt`. Sem ela, essas tags são omitidas em vez de apontar para um domínio falso. |
| `VITE_FORM_ENDPOINT` | Endpoint do formulário de contato (POST JSON). Funciona com Formspree, Getform, Basin ou backend próprio. **Sem ele, o formulário não finge sucesso:** valida os campos e abre o app de e-mail do visitante com a mensagem preenchida. |

## Onde editar o conteúdo

Todo o conteúdo factual vem do currículo (`public/cv/Derick-Putini-CV.pdf`) e fica centralizado:

- `src/data/profile.ts` — contato, localização, formação, certificados e **links do LinkedIn/GitHub** (vazios por enquanto; ao preencher, os botões "Em breve" viram links ativos no site inteiro).
- `src/data/projects.ts` — projetos. Os campos `links.demo`, `links.github` e `links.caseStudy` estão vazios de propósito; preencha quando publicar.
- `src/data/skills.ts` — "tabela periódica" de tecnologias, com a nota de onde cada uma aparece.
- `src/i18n/content.ts` — todos os textos de interface em inglês e português.

> **Java:** aparece na seção de skills por pedido explícito, mas **não consta no PDF atual do currículo**. Nenhum nível ou projeto é atribuído a ela. Se preferir manter o site 100% alinhado ao PDF, remova a entrada em `src/data/skills.ts`.

> **Visuais dos projetos:** são mockups conceituais feitos em código (`src/components/mockups`), sempre identificados como "Visual conceitual". Ao ter capturas reais, substitua o componente em `ProjectVisual.tsx`.

## Estrutura

```
src/
  animations/   curvas e durações compartilhadas
  components/
    cursor/     cursor customizado (desativado em touch)
    layout/     navbar, menu mobile, footer, progresso de página
    mockups/    visuais conceituais dos projetos (artboard escalável + parallax)
    preloader/  tela de abertura com progresso real
    projects/   card visual e modal de projeto
    three/      cena 3D do hero + fallback sem WebGL
    ui/         botões magnéticos, reveals, tilt, contadores…
  data/         conteúdo factual (fonte da verdade)
  hooks/        media queries, seção ativa, foco, clipboard, relógio
  i18n/         provider e textos EN/PT
  lib/          contato (validação/envio), utilitários
  providers/    smooth scroll e estado da intro
  sections/     Hero, About, Skills, Projects, Education, Differentials, Contact
```

## Decisões de performance e acessibilidade

- O chunk 3D é carregado sob demanda; shaders são compilados antes do primeiro frame (`compileAsync` quando disponível) e o loop de render pausa fora da tela.
- O preloader acompanha tarefas reais (fontes, cena 3D pronta, `load`) e nunca segura o site: a cena tem teto de 3 s, o total tem teto de 6 s e visitas repetidas na sessão são mais curtas.
- Iluminação 3D procedural (sem download de HDR).
- `prefers-reduced-motion`: desliga smooth scroll, troca o scroll horizontal de projetos por layout empilhado e congela a cena 3D.
- Navegação por teclado com skip link, foco visível, focus trap no menu e no modal, `Esc` para fechar e regiões `aria-live` para cópia e formulário.
- SEO: meta tags, Open Graph/Twitter, JSON-LD (`Person`) gerado a partir de `profile.ts`, favicon/manifest, `robots.txt` e `sitemap.xml`.

## Deploy

É um site estático: publique a pasta `dist/` em Vercel, Netlify, Cloudflare Pages ou GitHub Pages. Lembre de definir `VITE_SITE_URL` (e opcionalmente `VITE_FORM_ENDPOINT`) nas variáveis de ambiente do provedor antes do build.
