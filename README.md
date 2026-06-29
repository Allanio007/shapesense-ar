# ShapeSense AR v3 🩺
> **Simulação de Prótese Mamária por Realidade Aumentada WebAR**  
> Projeto autoral — Unidade 2, Capítulo 1-3 · Imersão em Realidade Aumentada · Residência em TIC 43

[![Netlify Status](https://api.netlify.com/api/v1/badges/placeholder/deploy-status)](https://shapesense-ar.netlify.app)
![A-Frame](https://img.shields.io/badge/A--Frame-1.4.2-e8709a?style=flat-square)
![AR.js](https://img.shields.io/badge/AR.js-3.x-5cc8b0?style=flat-square)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-f0c040?style=flat-square)
![Local](https://img.shields.io/badge/processamento-100%25%20local-green?style=flat-square)

---

## 📋 Sobre o projeto

O **ShapeSense AR v3** é a evolução WebAR do ShapeSense, agora usando **A-Frame + AR.js** para sobrepor um modelo anatômico 3D sobre o marcador **Hiro** via câmera do dispositivo. O app simula próteses mamárias com feedback visual em tempo real, mantendo o princípio de **processamento 100% local** — sem servidor, sem nuvem, sem API externa.

### O que há de novo na v3 (vs. v2 WebRTC)

| Recurso | v2 (Canvas/WebRTC) | v3 (A-Frame/AR.js) |
|---|---|---|
| Motor de renderização | Canvas 2D | A-Frame + WebGL |
| Rastreamento | Nenhum (câmera estática) | Marcador Hiro (AR.js) |
| Modelo 3D | Elipses 2D | Primitivas + GLB anatômico |
| Interações | Botão único | Tap (pulso) + Hold (escala) |
| Animação | CSS/JS | `animation__` nativo A-Frame |

---

## 🎮 Interações implementadas

### Interação 1 — Toque rápido (`gesture-tap`)
- **O que faz:** Dispara animação de "pulso" (bounce) no modelo + anel de pulso no HUD
- **Como funciona:** `gesture-detector` detecta toque < 250ms e emite `gesture-tap` na cena
- **Feedback visual:** Ring animado no centro da tela + halo teal pulsante no modelo

### Interação 2 — Pressionar e segurar (`mousedown/mouseup` + `gesture-hold-start/end`)
- **O que faz:** Amplia gradualmente o modelo enquanto o usuário segura o toque (> 500ms)
- **Como funciona:** `gesture-handler` incrementa `scale` a cada frame via `requestAnimationFrame`
- **Feedback visual:** Barra de progresso rosa no HUD + borda do card ativa

---

## 🗂 Estrutura do projeto

```
shapesense-v3/
├── index.html              ← Cena A-Frame + HUD ShapeSense
├── css/
│   └── style.css           ← Design system (tokens, HUD, cards)
├── js/
│   ├── components.js       ← Componentes A-Frame: gesture-detector + gesture-handler
│   └── app.js              ← Lógica: marcador, medidas locais, feedback HUD
├── assets/
│   └── modelo.glb          ← Modelo 3D anatômico (baixar do Sketchfab — ver abaixo)
├── .gitignore
└── README.md
```

---

## 🧊 Modelo 3D

O projeto usa um modelo anatômico feminino (low poly) em formato `.glb`.

**Para obter o modelo:**
1. Acesse [sketchfab.com](https://sketchfab.com)
2. Pesquise: `female torso anatomy low poly CC-BY`
3. Filtre por: **Downloadable** · **Creative Commons Attribution**
4. Baixe em formato `.glb` ou `.gltf`
5. Renomeie para `modelo.glb` e coloque na pasta `assets/`
6. Em `index.html`, descomente a linha:
   ```html
   <!-- <a-asset-item id="modelo-glb" src="assets/modelo.glb"></a-asset-item> -->
   ```
   E substitua o grupo de primitivas por:
   ```html
   <a-entity gltf-model="#modelo-glb" scale="0.5 0.5 0.5" animation-mixer></a-entity>
   ```

> 💡 Enquanto o `.glb` não está disponível, o projeto usa primitivas A-Frame (`a-cylinder`, `a-sphere`) que reproduzem fielmente a silhueta anatômica.

---

## 🚀 Como executar localmente

### Pré-requisito: extensão Live Server (VS Code)

```bash
# 1. Clone o repositório
git clone https://github.com/Allanio007/shapesense-ar.git
cd shapesense-ar

# 2. Abra no VS Code
code .

# 3. Clique com botão direito em index.html → "Open with Live Server"
# Abre em: http://127.0.0.1:5500
```

> ⚠️ A câmera **só funciona em `localhost` ou HTTPS**. O Live Server já serve em localhost.

### Marcador Hiro
- Imprima ou exiba na tela: [Marcador Hiro oficial](https://ar-js-org.github.io/AR.js/data/images/hiro.png)
- Aponte a câmera para o marcador e aguarde o modelo aparecer

---

## 🌐 Publicar no Netlify

```bash
# Opção 1: Netlify Drop (arraste a pasta)
# Acesse: https://app.netlify.com/drop
# Arraste a pasta shapesense-v3/

# Opção 2: CLI
npm install -g netlify-cli
netlify deploy --prod --dir .
```

---

## 🔒 Privacidade por design

| Operação | Tecnologia | Dado sai do dispositivo? |
|---|---|---|
| Câmera AR | AR.js + getUserMedia | ❌ Não |
| Rastreamento do marcador | AR.js (CPU local) | ❌ Não |
| Renderização 3D | A-Frame + WebGL | ❌ Não |
| Cálculo de medidas | JavaScript puro | ❌ Não |
| Armazenamento | sessionStorage | ❌ Não |

**Nenhum byte é enviado para servidores, nuvem ou terceiros.**

---

## 🎨 Design System

| Token | Valor |
|---|---|
| Cor principal | Rosa `#e8709a` |
| Fundo | Vinho escuro `#0f0610` |
| Acento segurança | Teal `#5cc8b0` |
| Acento alerta | Dourado `#f0c040` |
| Display font | Playfair Display |
| Body font | DM Sans |

---

## 📚 Tecnologias

- **A-Frame 1.4.2** — motor de cena 3D/AR declarativo
- **AR.js 3.x** — rastreamento de marcador via câmera (Hiro preset)
- **WebGL** — renderização 3D acelerada pelo GPU do dispositivo
- **Canvas 2D** — fallback de overlay de medidas
- **sessionStorage** — dados temporários locais (apagados ao fechar a aba)
- **Componentes A-Frame customizados** — `gesture-detector` + `gesture-handler`

---

## ⚕️ Aviso legal

Protótipo educacional — Residência em TIC 43.  
Não constitui produto médico registrado.  
Não substitui avaliação de cirurgião plástico habilitado.

---

## 👤 Autor

**Alanio Ferreira de Lima**  
GitHub: [@Allanio007](https://github.com/Allanio007)  
Programa: Residência em TIC 43 — Imersão em Realidade Aumentada  
Instituição: UFC / iREDE / Softex

---

**© 2025 ShapeSense AR · Residência em TIC 43**
