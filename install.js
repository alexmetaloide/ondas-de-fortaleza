'use strict';

const installSection = document.querySelector('#install-app');
const installButton = document.querySelector('#install-button');
const installHelp = document.querySelector('#install-help');
const installInstructions = document.querySelector('#install-instructions');
const openChrome = document.querySelector('#install-open-chrome');
const standalone = matchMedia('(display-mode: standalone)');
const android = /Android/i.test(navigator.userAgent);
const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let installPrompt;

function updateInstallButton() {
  installSection.hidden = standalone.matches || navigator.standalone === true ||
    (!android && !ios && !installPrompt);
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  updateInstallButton();
});

window.addEventListener('appinstalled', () => {
  installPrompt = null;
  installSection.hidden = true;
});

standalone.addEventListener('change', updateInstallButton);

if (android) {
  installInstructions.textContent = 'Abra esta página em uma aba normal do Chrome. Toque em ⋮ → Adicionar à tela inicial → Instalar.';
  openChrome.href = 'intent://' + location.host + location.pathname +
    '#Intent;scheme=https;package=com.android.chrome;end';
  openChrome.hidden = false;
} else if (ios) {
  installInstructions.textContent = 'No Safari, toque em Compartilhar → Adicionar à Tela de Início. Ative Abrir como App da Web, se aparecer, e toque em Adicionar.';
}

installButton.addEventListener('click', async () => {
  const prompt = installPrompt;
  if (prompt) {
    installPrompt = null;
    try {
      const choice = (await prompt.prompt()) || (await prompt.userChoice);
      if (choice?.outcome === 'accepted') {
        installSection.hidden = true;
        return;
      }
    } catch {
      // The browser may revoke the prompt before the user opens it.
    }
  }
  if (!android && !ios) {
    installInstructions.textContent = 'Use a opção de instalação no menu do navegador, se disponível.';
  }
  installHelp.hidden = !installHelp.hidden;
  installButton.setAttribute('aria-expanded', String(!installHelp.hidden));
});

updateInstallButton();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(error => {
    console.warn('Não foi possível registrar o aplicativo.', error.message);
  });
}
